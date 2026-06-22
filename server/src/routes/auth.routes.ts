import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { prisma } from '../lib/prisma.js'
import { toDbUser } from '../utils/serializers.js'
import {
  comparePassword,
  generateConfirmCode,
  hashPassword,
  publicUser,
  signToken,
} from '../utils/helpers.js'
import { config } from '../config.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const router = Router()

const registerSchema = z.object({
  contact: z.string().min(3),
  password: z.string().min(6),
})

const confirmSchema = z.object({
  contact: z.string().min(3),
  code: z.string().min(4),
})

const loginSchema = z.object({
  contact: z.string().min(3),
  password: z.string().min(1),
})

const resetSchema = z.object({
  contact: z.string().min(3),
  password: z.string().min(6),
})

router.post('/register', asyncHandler(async (req, res) => {
  const { contact, password } = registerSchema.parse(req.body)
  const normalized = contact.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { contact: normalized } })
  if (existing) {
    res.status(409).json({ error: 'Пользователь уже существует' })
    return
  }

  const passwordHash = await hashPassword(password)
  const confirmCode = generateConfirmCode()
  const expiresAt = new Date(Date.now() + config.confirmCodeTtlMs)

  await prisma.pendingUser.upsert({
    where: { contact: normalized },
    create: { contact: normalized, passwordHash, confirmCode, expiresAt },
    update: { passwordHash, confirmCode, expiresAt },
  })

  console.log(`[auth] Confirm code for ${normalized}: ${confirmCode}`)
  res.json({ message: 'Код подтверждения отправлен', contact: normalized })
}))

router.post('/confirm', asyncHandler(async (req, res) => {
  const { contact, code } = confirmSchema.parse(req.body)
  const normalized = contact.trim().toLowerCase()

  const pending = await prisma.pendingUser.findUnique({ where: { contact: normalized } })
  if (!pending) {
    res.status(400).json({ error: 'Регистрация не найдена' })
    return
  }
  if (pending.expiresAt < new Date()) {
    res.status(400).json({ error: 'Код истёк, зарегистрируйтесь снова' })
    return
  }
  if (pending.confirmCode !== code.trim()) {
    res.status(400).json({ error: 'Неверный код' })
    return
  }

  const user = await prisma.user.create({
    data: {
      id: uuid(),
      contact: normalized,
      passwordHash: pending.passwordHash,
    },
  })

  await prisma.pendingUser.delete({ where: { contact: normalized } })

  const dbUser = toDbUser(user)
  const token = signToken(user.id)
  res.json({ token, user: publicUser(dbUser), needsProfile: true })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { contact, password } = loginSchema.parse(req.body)
  const normalized = contact.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { contact: normalized } })

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'Неверный логин или пароль' })
    return
  }

  res.json({ token: signToken(user.id), user: publicUser(toDbUser(user)) })
}))

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { contact, password } = resetSchema.parse(req.body)
  const normalized = contact.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { contact: normalized } })

  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password) },
  })
  res.json({ message: 'Пароль обновлён' })
}))

router.post('/resend-code', asyncHandler(async (req, res) => {
  const { contact } = z.object({ contact: z.string() }).parse(req.body)
  const normalized = contact.trim().toLowerCase()
  const pending = await prisma.pendingUser.findUnique({ where: { contact: normalized } })

  if (!pending) {
    res.status(400).json({ error: 'Регистрация не найдена' })
    return
  }

  const confirmCode = generateConfirmCode()
  const expiresAt = new Date(Date.now() + config.confirmCodeTtlMs)

  await prisma.pendingUser.update({
    where: { contact: normalized },
    data: { confirmCode, expiresAt },
  })

  console.log(`[auth] Confirm code for ${normalized}: ${confirmCode}`)
  res.json({ message: 'Код отправлен повторно' })
}))

router.get('/me', authRequired, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    res.status(404).json({ error: 'Пользователь не найден' })
    return
  }
  res.json(publicUser(toDbUser(user)))
}))

export default router
