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
  avatar: z.string().optional(),
  about: z.string().max(ABOUT_MAX).optional(),
  showTours: z.boolean().optional(),
})

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }
  res.json(publicUser(toDbUser(user)))
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

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...data,
      ...(data.avatar !== undefined && !data.avatar
        ? { avatar: unsplashAvatar('1507003211169-0a1dd7228f2d') }
        : {}),
    },
  })
  res.json(publicUser(toDbUser(updated)))
}))

export default router
