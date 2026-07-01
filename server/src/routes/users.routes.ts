import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { toDbUser } from '../utils/serializers.js'
import { publicUser } from '../utils/helpers.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'
import { emitReviewCreated, emitUserChanged } from '../ws/chat.js'
import { validateAuthContact } from '../utils/contactPolicy.js'

const router = Router()

const NICKNAME_MAX = 15
const ABOUT_MAX = 200
const AVATAR_MAX_BYTES = 5 * 1024 * 1024
const AVATAR_DATA_URL_RE = /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/
const AVATAR_HTTP_RE = /^https?:\/\/.+/i
const AVATAR_MAX_URL_LENGTH = 2048

const avatarSchema = z
  .string()
  .refine((value) => {
    if (!value) return true
    if (AVATAR_HTTP_RE.test(value)) return value.length <= AVATAR_MAX_URL_LENGTH
    if (!AVATAR_DATA_URL_RE.test(value)) return false
    const [, payload = ''] = value.split(',', 2)
    return Math.ceil((payload.length * 3) / 4) <= AVATAR_MAX_BYTES
  }, 'Аватар должен быть PNG, JPG или WebP до 5 МБ')
const optionalAvatarSchema = avatarSchema.nullish()

const profileSchema = z.object({
  nickname: z.string().min(1).max(NICKNAME_MAX),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  patronymic: z.string().optional(),
  birthDate: z.string().min(1),
  avatar: optionalAvatarSchema,
  about: z.string().max(ABOUT_MAX).optional(),
})

const settingsSchema = z.object({
  nickname: z.string().min(1).max(NICKNAME_MAX).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  avatar: optionalAvatarSchema,
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
  emitReviewCreated(userId, review.id)
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
      avatar: data.avatar ?? '',
      profileComplete: true,
    },
  })
  emitUserChanged(updated.id)
  res.json(publicUser(toDbUser(updated)))
}))

router.patch('/me', authRequired, asyncHandler(async (req, res) => {
  const data = settingsSchema.parse(req.body)
  const { bio, location, email, phone: _phone, age, avatar, ...dbData } = data
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
    const normalizedEmail = email.trim().toLowerCase()
    const contactCheck = validateAuthContact(normalizedEmail)
    if (!contactCheck.ok) {
      res.status(400).json({ error: contactCheck.error })
      return
    }
    const contactTaken = await prisma.user.findUnique({ where: { contact: normalizedEmail } })
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
      ...(avatar !== undefined ? { avatar: avatar ?? '' } : {}),
    },
  })
  emitUserChanged(updated.id)
  res.json(publicUser(toDbUser(updated)))
}))

export default router
