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

async function toFrontendTrip(trip: Trip) {
  const [organizer, signups] = await Promise.all([
    prisma.user.findUnique({ where: { id: trip.creatorId } }),
    prisma.tripSignup.findMany({
      where: { tripId: trip.id },
      include: { user: true },
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

  res.json(await Promise.all(trips.map(toFrontendTrip)))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const trip = await prisma.trip.findFirst({
    where: { id, isDraft: false },
  })
  if (!trip) {
    res.status(404).json({ error: 'Поездка не найдена' })
    return
  }
  res.json(await toFrontendTrip(trip))
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
  res.status(201).json(await toFrontendTrip(trip))
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

  const already = await prisma.tripSignup.findUnique({
    where: { tripId_userId: { tripId: trip.id, userId: req.userId! } },
  })
  if (already) {
    res.status(409).json({ error: 'Вы уже записаны' })
    return
  }

  const [, updatedTrip] = await prisma.$transaction([
    prisma.tripSignup.create({
      data: { tripId: trip.id, userId: req.userId! },
    }),
    prisma.trip.update({
      where: { id: trip.id },
      data: { freeSpots: { decrement: 1 } },
    }),
  ])

  await addUserToTripChat(trip.id, req.userId!)
  res.json(await toFrontendTrip(updatedTrip))
}))

export default router
