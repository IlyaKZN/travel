import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { getVapidPublicKey } from '../services/push.service.js'

const router = Router()

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

router.get('/vapid-key', (_req, res) => {
  res.json({ publicKey: getVapidPublicKey() })
})

router.post('/subscribe', authRequired, asyncHandler(async (req, res) => {
  const data = subscribeSchema.parse(req.body)

  await prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: {
      userId: req.userId!,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    },
    update: {
      userId: req.userId!,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
    },
  })

  res.status(201).json({ message: 'Подписка сохранена' })
}))

router.delete('/subscribe', authRequired, asyncHandler(async (req, res) => {
  const { endpoint } = z.object({ endpoint: z.string().url() }).parse(req.body)

  await prisma.pushSubscription.deleteMany({
    where: { userId: req.userId!, endpoint },
  })

  res.status(204).send()
}))

export default router
