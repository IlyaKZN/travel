import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import type { Trip } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { authOptional, authRequired } from '../middleware/auth.js'
import { detectLocationType, publicUser, unsplash } from '../utils/helpers.js'
import { addUserToTripChat, createTripConversation } from '../services/chat.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'
import { normalizeTransport, splitTripLocation } from '../utils/frontendAdapters.js'
import { toDbUser } from '../utils/serializers.js'
import { emitConversationUpdated, emitTripChanged } from '../ws/chat.js'
import {
  notifyCompanionRequestApproved,
  notifyCompanionRequestDeclined,
  notifyOrganizerJoinRequest,
} from '../services/trip-push.service.js'
import {
  buildTripChangeSummary,
  createNotification,
  notifyTripParticipantsUpdated,
} from '../services/notification.service.js'

const router = Router()

const LOCATION_MAX = 100
const PARTICIPANTS_MAX = 10
const PRICE_MAX = 9_999_999

const tripSchema = z.object({
  from: z.string().min(1).max(LOCATION_MAX),
  to: z.string().min(1).max(LOCATION_MAX),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  transport: z.string().min(1),
  seats: z.number().int().positive().max(PARTICIPANTS_MAX),
  budget: z.number().nonnegative().max(PRICE_MAX).default(0),
  description: z.string().min(1),
  info: z.string().optional(),
  images: z.array(z.string()).max(10).default([]),
  video: z.string().optional(),
  isClosed: z.boolean().default(false),
  isDraft: z.boolean().default(false),
})

async function toFrontendTrip(trip: Trip, viewerId?: string) {
  const isOrganizer = viewerId === trip.creatorId
  const joinRequestWhere = !viewerId
    ? { tripId: trip.id, userId: '__anonymous__' }
    : isOrganizer
      ? { tripId: trip.id }
      : { tripId: trip.id, userId: viewerId }
  const [organizer, signups, joinRequests] = await Promise.all([
    prisma.user.findUnique({ where: { id: trip.creatorId } }),
    prisma.tripSignup.findMany({
      where: { tripId: trip.id },
      include: { user: true },
    }),
    prisma.tripJoinRequest.findMany({
      where: joinRequestWhere,
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    }),
  ])
  const { from, to } = splitTripLocation(trip.location)
  const participantIds = [trip.creatorId, ...signups.map((signup) => signup.userId)]
  const participants = [
    ...(organizer ? [publicUser(toDbUser(organizer))] : []),
    ...signups.map((signup) => publicUser(toDbUser(signup.user))),
  ]
  const seats = trip.maxParticipants
  const taken = Math.min(seats, Math.max(participantIds.length, seats - trip.freeSpots))

  return {
    id: trip.id,
    from,
    to,
    startAt: trip.startDate.toISOString(),
    endAt: trip.endDate.toISOString(),
    transport: normalizeTransport(trip.transport),
    seats,
    taken,
    budget: trip.price,
    organizerId: trip.creatorId,
    organizer: organizer ? publicUser(toDbUser(organizer)) : undefined,
    participantIds,
    participants,
    pendingRequestIds: joinRequests.map((request) => request.userId),
    pendingRequests: isOrganizer
      ? joinRequests.map((request) => ({
          user: publicUser(toDbUser(request.user)),
          createdAt: request.createdAt.toISOString(),
        }))
      : [],
    description: trip.shortDescription,
    info: trip.fullPlan,
  }
}

router.get('/', authOptional, asyncHandler(async (req, res) => {
  const search = (req.query.search as string)?.toLowerCase() ?? ''
  const locationType = req.query.locationType as string | undefined
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined
  const creatorId = req.query.creatorId as string | undefined

  let trips = await prisma.trip.findMany({
    where: {
      isDraft: false,
      ...(locationType ? { locationType: locationType as 'city' | 'festival' | 'nature' } : {}),
      ...(creatorId ? { creatorId } : {}),
      ...(maxPrice !== undefined && !Number.isNaN(maxPrice) ? { price: { lte: maxPrice } } : {}),
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  })

  if (search) {
    trips = trips.filter(
      (t) =>
        t.location.toLowerCase().includes(search) ||
        t.shortDescription.toLowerCase().includes(search) ||
        t.transport.toLowerCase().includes(search),
    )
  }

  res.json(await Promise.all(trips.map((trip) => toFrontendTrip(trip, req.userId))))
}))

router.get('/:id', authOptional, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findFirst({
    where: { id, isDraft: false },
  })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  res.json(await toFrontendTrip(trip, req.userId))
}))

router.post('/', authRequired, asyncHandler(async (req, res) => {
  const data = tripSchema.parse(req.body)
  const location = `${data.from.trim()} → ${data.to.trim()}`

  const start = new Date(data.startAt)
  const end = new Date(data.endAt)
  if (start < new Date()) {
    res.status(400).json({ error: 'Дата начала не может быть в прошлом' })
    return
  }
  if (end < start) {
    res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' })
    return
  }

  const trip = await prisma.trip.create({
    data: {
      id: uuid(),
      creatorId: req.userId!,
      location,
      locationType: detectLocationType(location),
      shortDescription: data.description,
      fullPlan: data.info?.trim() || data.description,
      maxParticipants: data.seats,
      freeSpots: Math.max(0, data.seats - 1),
      price: data.budget,
      startDate: start,
      endDate: end,
      transport: normalizeTransport(data.transport),
      images: data.images.length ? data.images : [unsplash('1488646953015-85cb44e25828')],
      video: data.video,
      isClosed: data.isClosed,
      isDraft: data.isDraft,
    },
  })
  await createTripConversation(trip.id)
  if (!trip.isDraft) {
    emitTripChanged('created', trip.id)
  }
  res.status(201).json(await toFrontendTrip(trip, req.userId))
}))

router.post('/:id/signup', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  if (trip.freeSpots <= 0) {
    res.status(400).json({ error: 'Нет свободных мест' })
    return
  }
  if (trip.creatorId === req.userId) {
    res.status(400).json({ error: 'Организатор уже участвует в поездке' })
    return
  }

  const already = await prisma.tripSignup.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: req.userId! } },
  })
  if (already) {
    res.status(409).json({ error: 'Вы уже записаны' })
    return
  }

  const existingRequest = await prisma.tripJoinRequest.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: req.userId! } },
  })
  if (existingRequest) {
    res.status(409).json({ error: 'Заявка уже отправлена' })
    return
  }

  await prisma.tripJoinRequest.create({
    data: { tripId: trip.id, userId: req.userId! },
  })
  void createNotification({
    userId: trip.creatorId,
    kind: 'request_incoming',
    tripId: trip.id,
    actorId: req.userId!,
  })
  emitTripChanged('request_created', trip.id, [trip.creatorId, req.userId!])
  void notifyOrganizerJoinRequest(trip.id, req.userId!)
  res.status(202).json(await toFrontendTrip(trip, req.userId))
}))

router.delete('/:id/signup', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }

  await prisma.tripJoinRequest.deleteMany({
    where: { tripId: trip.id, userId: req.userId! },
  })
  emitTripChanged('request_cancelled', trip.id, [trip.creatorId, req.userId!])
  res.json(await toFrontendTrip(trip, req.userId))
}))

router.post('/:id/requests/:userId/approve', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const targetUserId = routeParam(req.params.userId)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  if (trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Только организатор может принимать заявки' })
    return
  }
  if (trip.freeSpots <= 0) {
    res.status(400).json({ error: 'Нет свободных мест' })
    return
  }

  const request = await prisma.tripJoinRequest.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: targetUserId } },
  })
  if (!request) {
    res.status(404).json({ error: 'Заявка не найдена' })
    return
  }

  const already = await prisma.tripSignup.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: targetUserId } },
  })
  if (already) {
    await prisma.tripJoinRequest.delete({
      where: { tripId_userId: { tripId: trip.id, userId: targetUserId } },
    })
    emitTripChanged('request_approved', trip.id, [trip.creatorId, targetUserId])
    void notifyCompanionRequestApproved(trip.id, targetUserId)
    void createNotification({
      userId: targetUserId,
      kind: 'request_accepted',
      tripId: trip.id,
      actorId: req.userId!,
    })
    res.json(await toFrontendTrip(trip, req.userId))
    return
  }

  const [, , updatedTrip] = await prisma.$transaction([
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
  ])

  await addUserToTripChat(trip.id, targetUserId)
  const conversation = await prisma.conversation.findUnique({ where: { tripId: trip.id } })
  if (conversation) {
    await emitConversationUpdated(conversation.id)
  }
  emitTripChanged('request_approved', trip.id)
  void notifyCompanionRequestApproved(trip.id, targetUserId)
  void createNotification({
    userId: targetUserId,
    kind: 'request_accepted',
    tripId: trip.id,
    actorId: req.userId!,
  })
  res.json(await toFrontendTrip(updatedTrip, req.userId))
}))

router.post('/:id/requests/:userId/decline', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const targetUserId = routeParam(req.params.userId)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  if (trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Только организатор может отклонять заявки' })
    return
  }

  await prisma.tripJoinRequest.deleteMany({
    where: { tripId: trip.id, userId: targetUserId },
  })
  emitTripChanged('request_declined', trip.id, [trip.creatorId, targetUserId])
  void notifyCompanionRequestDeclined(trip.id, targetUserId)
  void createNotification({
    userId: targetUserId,
    kind: 'request_declined',
    tripId: trip.id,
    actorId: req.userId!,
  })
  res.json(await toFrontendTrip(trip, req.userId))
}))

router.patch('/:id', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  if (trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Только организатор может редактировать поездку' })
    return
  }

  const data = tripSchema.parse(req.body)
  const location = `${data.from.trim()} → ${data.to.trim()}`
  const start = new Date(data.startAt)
  const end = new Date(data.endAt)
  if (end < start) {
    res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' })
    return
  }

  const signupCount = await prisma.tripSignup.count({ where: { tripId: id } })
  const participantCount = signupCount + 1
  if (data.seats < participantCount) {
    res.status(400).json({ error: 'Число мест не может быть меньше текущего числа участников' })
    return
  }

  const updatedTrip = await prisma.trip.update({
    where: { id },
    data: {
      location,
      locationType: detectLocationType(location),
      shortDescription: data.description,
      fullPlan: data.info?.trim() || data.description,
      maxParticipants: data.seats,
      freeSpots: Math.max(0, data.seats - participantCount),
      price: data.budget,
      startDate: start,
      endDate: end,
      transport: normalizeTransport(data.transport),
      ...(data.images.length ? { images: data.images } : {}),
      video: data.video,
      isClosed: data.isClosed,
      isDraft: data.isDraft,
    },
  })

  const changeSummary = buildTripChangeSummary(trip, updatedTrip)
  void notifyTripParticipantsUpdated(trip.id, trip.creatorId, changeSummary)

  emitTripChanged('updated', trip.id)
  res.json(await toFrontendTrip(updatedTrip, req.userId))
}))

router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  if (trip.creatorId !== req.userId) {
    res.status(403).json({ error: 'Только организатор может удалить поездку' })
    return
  }

  await prisma.trip.delete({ where: { id } })
  emitTripChanged('deleted', trip.id)
  res.json({ message: 'Поездка удалена' })
}))

export default router
