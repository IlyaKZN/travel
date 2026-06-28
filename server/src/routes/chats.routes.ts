import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { conversationInclude, toDbConversation, toDbUser } from '../utils/serializers.js'
import {
  enrichConversation,
  enrichMessage,
  getOrCreateDm,
  getOrCreateTripChat,
  markConversationRead,
  publicUserBrief,
  sendMessage,
} from '../services/chat.service.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'
import { emitChatMessage, emitConversationUpdated } from '../ws/chat.js'

const router = Router()

router.use(authRequired)

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.userId!

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: conversationInclude,
    orderBy: { lastMessageAt: 'desc' },
  })

  const enriched = await Promise.all(
    conversations.map((c) => enrichConversation(toDbConversation(c), userId)),
  )
  res.json(enriched)
}))

router.get('/users', asyncHandler(async (req, res) => {
  const userId = req.userId!
  const search = ((req.query.search as string) || '').toLowerCase()

  let users = await prisma.user.findMany({
    where: { id: { not: userId }, profileComplete: true },
    take: 20,
  })

  if (search) {
    users = users.filter(
      (u) =>
        u.nickname.toLowerCase().includes(search) ||
        u.firstName.toLowerCase().includes(search) ||
        u.lastName.toLowerCase().includes(search),
    )
  }

  res.json(users.map((u) => publicUserBrief(toDbUser(u))))
}))

router.post('/dm/:userId', asyncHandler(async (req, res) => {
  try {
    const conversation = await getOrCreateDm(req.userId!, routeParam(req.params.userId))
    await emitConversationUpdated(conversation.id)
    res.json(await enrichConversation(conversation, req.userId!))
  } catch (e) {
    if (e instanceof Error && e.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'Пользователь не найден' })
      return
    }
    if (e instanceof Error && e.message === 'SELF_DM') {
      res.status(400).json({ error: 'Нельзя написать самому себе' })
      return
    }
    throw e
  }
}))

router.get('/trip/:tripId', asyncHandler(async (req, res) => {
  try {
    const conversation = await getOrCreateTripChat(routeParam(req.params.tripId), req.userId!)
    await emitConversationUpdated(conversation.id)
    res.json(await enrichConversation(conversation, req.userId!))
  } catch (e) {
    if (e instanceof Error && e.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Чат доступен только участникам поездки' })
      return
    }
    res.status(404).json({ error: 'Поездка не найдена' })
  }
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  })
  if (!conversation || !conversation.participants.some((p) => p.userId === req.userId!)) {
    res.status(404).json({ error: 'Чат не найден' })
    return
  }
  res.json(await enrichConversation(toDbConversation(conversation), req.userId!))
}))

router.post('/:id/read', asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  })
  if (!conversation || !conversation.participants.some((p) => p.userId === req.userId!)) {
    res.status(404).json({ error: 'Чат не найден' })
    return
  }

  await markConversationRead(id, req.userId!)
  await emitConversationUpdated(id)
  res.json(await enrichConversation(toDbConversation(conversation), req.userId!))
}))

router.get('/:id/messages', asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: conversationInclude,
  })
  if (!conversation || !conversation.participants.some((p) => p.userId === req.userId!)) {
    res.status(404).json({ error: 'Чат не найден' })
    return
  }

  const after = req.query.after as string | undefined
  const messages = await prisma.message.findMany({
    where: {
      conversationId: conversation.id,
      ...(after ? { createdAt: { gt: new Date(after) } } : {}),
    },
    orderBy: { createdAt: 'asc' },
  })

  const enriched = await Promise.all(messages.map((m) => enrichMessage({
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
  })))
  await markConversationRead(id, req.userId!)
  await emitConversationUpdated(id)
  res.json(enriched)
}))

router.post('/:id/messages', asyncHandler(async (req, res) => {
  const { text } = z.object({ text: z.string().min(1).max(2000) }).parse(req.body)

  try {
    const message = await sendMessage(routeParam(req.params.id), req.userId!, text)
    await emitChatMessage(routeParam(req.params.id), message)
    res.status(201).json(await enrichMessage(message))
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      res.status(404).json({ error: 'Чат не найден' })
      return
    }
    if (e instanceof Error && e.message === 'FORBIDDEN') {
      res.status(403).json({ error: 'Нет доступа к чату' })
      return
    }
    throw e
  }
}))

export default router
