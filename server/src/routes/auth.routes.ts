import { Router, type Response } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { toDbUser } from '../utils/serializers.js'
import {
  comparePassword,
  generateConfirmCode,
  hashPassword,
  publicUser,
  signToken,
} from '../utils/helpers.js'
import { validateTelegramInitData, telegramContact } from '../utils/telegram.js'
import { config } from '../config.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { emitUserChanged } from '../ws/chat.js'
import { validateAuthContact } from '../utils/contactPolicy.js'

const router = Router()

function rejectInvalidContact(res: Response, contact: string): boolean {
  const check = validateAuthContact(contact)
  if (!check.ok) {
    res.status(400).json({ error: check.error })
    return true
  }
  return false
}

const registerSchema = z.object({
  contact: z.string().min(3).optional(),
  email: z.string().min(3).optional(),
  password: z.string().min(6),
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
})

const confirmSchema = z.object({
  contact: z.string().min(3),
  code: z.string().min(4),
})

const loginSchema = z.object({
  contact: z.string().min(3).optional(),
  email: z.string().min(3).optional(),
  password: z.string().min(1),
  remember: z.boolean().optional(),
})

const resetSchema = z.object({
  contact: z.string().min(3),
  password: z.string().min(6),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

router.post('/register', asyncHandler(async (req, res) => {
  const { contact, email, password, firstName, lastName } = registerSchema.parse(req.body)
  const rawContact = contact ?? email
  if (!rawContact) {
    res.status(400).json({ error: 'Укажите email, телефон или contact' })
    return
  }
  const hasFrontendProfile = firstName !== undefined
  const normalized = rawContact.trim().toLowerCase()

  if (rejectInvalidContact(res, normalized)) return

  const existing = await prisma.user.findUnique({ where: { contact: normalized } })
  if (existing) {
    res.status(409).json({ error: 'Пользователь уже существует' })
    return
  }

  const passwordHash = await hashPassword(password)
  if (hasFrontendProfile) {
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        contact: normalized,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName?.trim() ?? '',
        nickname: normalized.split('@')[0].slice(0, 15),
        profileComplete: true,
      },
    })
    emitUserChanged(user.id)
    res.status(201).json({
      token: signToken(user.id),
      user: publicUser(toDbUser(user)),
      needsProfile: false,
    })
    return
  }

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

  if (rejectInvalidContact(res, normalized)) return

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
  emitUserChanged(user.id)
  res.json({ token, user: publicUser(dbUser), needsProfile: true })
}))

router.post('/login', asyncHandler(async (req, res) => {
  const { contact, email, password, remember } = loginSchema.parse(req.body)
  const rawContact = contact ?? email
  if (!rawContact) {
    res.status(400).json({ error: 'Укажите email, телефон или contact' })
    return
  }
  const normalized = rawContact.trim().toLowerCase()

  if (rejectInvalidContact(res, normalized)) return

  const user = await prisma.user.findUnique({ where: { contact: normalized } })

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'Неверный логин или пароль' })
    return
  }

  const expiresIn = remember ? '30d' : '7d'
  res.json({ token: signToken(user.id, expiresIn), user: publicUser(toDbUser(user)) })
}))

router.post('/telegram', asyncHandler(async (req, res) => {
  const { initData } = z.object({ initData: z.string().min(1) }).parse(req.body)

  if (!config.telegramBotToken) {
    res.status(503).json({ error: 'Telegram auth не настроен на сервере' })
    return
  }

  const tgUser = validateTelegramInitData(initData, config.telegramBotToken)
  if (!tgUser) {
    res.status(401).json({ error: 'Неверные или устаревшие данные Telegram' })
    return
  }

  const telegramId = String(tgUser.id)
  let user = await prisma.user.findUnique({ where: { telegramId } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: uuid(),
        telegramId,
        contact: telegramContact(telegramId),
        passwordHash: await hashPassword(crypto.randomBytes(32).toString('hex')),
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? '',
        nickname: tgUser.username ?? `user${telegramId}`,
        avatar: tgUser.photo_url ?? '',
      },
    })
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? user.lastName,
        ...(tgUser.photo_url && !user.avatar ? { avatar: tgUser.photo_url } : {}),
        ...(tgUser.username && !user.nickname ? { nickname: tgUser.username } : {}),
      },
    })
  }

  const dbUser = toDbUser(user)
  emitUserChanged(user.id)
  res.json({
    token: signToken(user.id),
    user: publicUser(dbUser),
    needsProfile: !user.profileComplete,
  })
}))

router.post('/reset-password', asyncHandler(async (req, res) => {
  const { contact, password } = resetSchema.parse(req.body)
  const normalized = contact.trim().toLowerCase()

  if (rejectInvalidContact(res, normalized)) return

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

router.patch('/password', authRequired, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user || !(await comparePassword(currentPassword, user.passwordHash))) {
    res.status(400).json({ error: 'Текущий пароль указан неверно' })
    return
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  })
  res.json({ message: 'Пароль обновлён' })
}))

router.post('/resend-code', asyncHandler(async (req, res) => {
  const { contact } = z.object({ contact: z.string() }).parse(req.body)
  const normalized = contact.trim().toLowerCase()

  if (rejectInvalidContact(res, normalized)) return

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
    res.status(401).json({ error: 'Недействительный токен' })
    return
  }
  res.json(publicUser(toDbUser(user)))
}))

router.post('/logout', authRequired, asyncHandler(async (_req, res) => {
  res.status(204).send()
}))

export default router
