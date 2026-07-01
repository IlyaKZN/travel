import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'
import { addUserToTripChat } from '../services/chat.service.js'
import { emitConversationUpdated, emitTripChanged } from '../ws/chat.js'
import {
  notifyCompanionRequestApproved,
  notifyCompanionRequestDeclined,
} from '../services/trip-push.service.js'

const router = Router()

function toFrontendNotification(
  notification: {
    id: string
    kind: string
    tripId: string
    actorId: string | null
    changeSummary: string | null
    read: boolean
    createdAt: Date
  },
) {
  return {
    id: notification.id,
    kind: notification.kind,
    tripId: notification.tripId,
    actorId: notification.actorId ?? undefined,
    at: notification.createdAt.toISOString(),
    read: notification.read,
    changeSummary: notification.changeSummary ?? undefined,
  }
}

router.get('/', authRequired, asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId!, dismissed: false },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json(notifications.map(toFrontendNotification))
}))

router.post('/read-all', authRequired, asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId!, read: false, dismissed: false },
    data: { read: true },
  })
  res.json({ message: 'ok' })
}))

router.patch('/:id/read', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.userId! },
  })
  if (!notification) {
    res.status(404).json({ error: 'Уведомление не найдено' })
    return
  }
  const updated = await prisma.notification.update({
    where: { id },
    data: { read: true },
  })
  res.json(toFrontendNotification(updated))
}))

router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.userId! },
  })
  if (!notification) {
    res.status(404).json({ error: 'Уведомление не найдено' })
    return
  }
  await prisma.notification.update({
    where: { id },
    data: { dismissed: true, read: true },
  })
  res.status(204).end()
}))

router.post('/:id/accept', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.userId!, kind: 'request_incoming', dismissed: false },
  })
  if (!notification || !notification.actorId) {
    res.status(404).json({ error: 'Уведомление не найдено' })
    return
  }

  const trip = await prisma.trip.findUnique({ where: { id: notification.tripId } })
  if (!trip || trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Недостаточно прав' })
    return
  }
  if (trip.freeSpots <= 0) {
    res.status(400).json({ error: 'Нет свободных мест' })
    return
  }

  const targetUserId = notification.actorId
  const request = await prisma.tripJoinRequest.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: targetUserId } },
  })
  if (!request) {
    await prisma.notification.update({ where: { id }, data: { dismissed: true, read: true } })
    res.status(404).json({ error: 'Заявка уже обработана' })
    return
  }

  await prisma.$transaction([
    prisma.tripJoinRequest.delete({
      where: { tripId_userId: { tripId: trip.id, userId: targetUserId } },
    }),
    prisma.tripSignup.create({
      data: { tripId: trip.id, userId: targetUserId },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: { freeSpots: { decrement: 1 } },
    }),
    prisma.notification.update({
      where: { id },
      data: { dismissed: true, read: true },
    }),
  ])

  await addUserToTripChat(trip.id, targetUserId)
  const conversation = await prisma.conversation.findUnique({ where: { tripId: trip.id } })
  if (conversation) {
    await emitConversationUpdated(conversation.id)
  }
  emitTripChanged('request_approved', trip.id)
  void notifyCompanionRequestApproved(trip.id, targetUserId)

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      kind: 'request_accepted',
      tripId: trip.id,
      actorId: req.userId!,
    },
  })

  res.json({ message: 'ok' })
}))

router.post('/:id/decline', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const notification = await prisma.notification.findFirst({
    where: { id, userId: req.userId!, kind: 'request_incoming', dismissed: false },
  })
  if (!notification || !notification.actorId) {
    res.status(404).json({ error: 'Уведомление не найдено' })
    return
  }

  const trip = await prisma.trip.findUnique({ where: { id: notification.tripId } })
  if (!trip || trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Недостаточно прав' })
    return
  }

  const targetUserId = notification.actorId
  await prisma.tripJoinRequest.deleteMany({
    where: { tripId: trip.id, userId: targetUserId },
  })
  await prisma.notification.update({
    where: { id },
    data: { dismissed: true, read: true },
  })

  emitTripChanged('request_declined', trip.id, [trip.creatorId, targetUserId])
  void notifyCompanionRequestDeclined(trip.id, targetUserId)

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      kind: 'request_declined',
      tripId: trip.id,
      actorId: req.userId!,
    },
  })

  res.json({ message: 'ok' })
}))

export default router
