import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { toDbUser } from '../utils/serializers.js'
import { publicUser, unsplashAvatar } from '../utils/helpers.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'

const router = Router()

const NICKNAME_MAX = 15
const ABOUT_MAX = 200

const profileSchema = z.object({
  nickname: z.string().min(1).max(NICKNAME_MAX),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  patronymic: z.string().optional(),
  birthDate: z.string().min(1),
  avatar: z.string().optional(),
  about: z.string().max(ABOUT_MAX).optional(),
})

const settingsSchema = z.object({
  nickname: z.string().min(1).max(NICKNAME_MAX).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  about: z.string().max(ABOUT_MAX).optional(),
  bio: z.string().max(ABOUT_MAX).optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  age: z.union([z.string(), z.number()]).optional(),
  showTours: z.boolean().optional(),
})

const reviewSchema = z.object({
  text: z.string().min(1).max(500),
})

function serializeReview(review: { id: string; authorId: string; text: string; createdAt: Date }) {
  return {
    id: review.id,
    authorId: review.authorId,
    text: review.text,
    at: review.createdAt.toISOString(),
  }
}

router.get('/', asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { profileComplete: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  })
  res.json(users.map((user) => publicUser(toDbUser(user))))
}))

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }
  res.json(publicUser(toDbUser(user)))
}))

router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const userId = routeParam(req.params.id)
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(reviews.map(serializeReview))
}))

router.post('/:id/reviews', authRequired, asyncHandler(async (req, res) => {
  const userId = routeParam(req.params.id)
  if (userId === req.userId) {
    res.status(400).json({ error: 'Нельзя оставить отзыв самому себе' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  const { text } = reviewSchema.parse(req.body)
  const review = await prisma.review.create({
    data: {
      userId,
      authorId: req.userId!,
      text: text.trim(),
    },
  })
  res.status(201).json(serializeReview(review))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: routeParam(req.params.id) } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }
  res.json(publicUser(toDbUser(user)))
}))

router.post('/profile', authRequired, asyncHandler(async (req, res) => {
  const data = profileSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  const nicknameTaken = await prisma.user.findFirst({
    where: { nickname: data.nickname, NOT: { id: user.id } },
  })
  if (nicknameTaken) {
    res.status(409).json({ error: 'Имя уже занято' })
    return
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...data,
      avatar: data.avatar || unsplashAvatar('1507003211169-0a1dd7228f2d'),
      profileComplete: true,
    },
  })
  res.json(publicUser(toDbUser(updated)))
}))

router.patch('/me', authRequired, asyncHandler(async (req, res) => {
  const data = settingsSchema.parse(req.body)
  const { bio, location, email, phone: _phone, age, ...dbData } = data
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  if (data.nickname) {
    const nicknameTaken = await prisma.user.findFirst({
      where: { nickname: data.nickname, NOT: { id: user.id } },
    })
    if (nicknameTaken) {
      res.status(409).json({ error: 'Имя уже занято' })
      return
    }
  }

  if (email && email.trim().toLowerCase() !== user.contact) {
    const contactTaken = await prisma.user.findUnique({ where: { contact: email.trim().toLowerCase() } })
    if (contactTaken) {
      res.status(409).json({ error: 'Email уже занят' })
      return
    }
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...dbData,
      ...(email ? { contact: email.trim().toLowerCase() } : {}),
      ...(bio !== undefined ? { about: bio } : {}),
      ...(location !== undefined ? { patronymic: location } : {}),
      ...(age !== undefined ? { birthDate: String(age) } : {}),
      ...(dbData.avatar !== undefined && !dbData.avatar
        ? { avatar: unsplashAvatar('1507003211169-0a1dd7228f2d') }
        : {}),
    },
  })
  res.json(publicUser(toDbUser(updated)))
}))

export default router
