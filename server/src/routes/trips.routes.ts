import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import type { Trip } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { toDbTrip } from '../utils/serializers.js'
import { authOptional, authRequired } from '../middleware/auth.js'
import { creatorLabel, detectLocationType, unsplash } from '../utils/helpers.js'
import { addUserToTripChat, createTripConversation } from '../services/chat.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'

const router = Router()

const tripSchema = z.object({
  location: z.string().min(1),
  shortDescription: z.string().min(1),
  maxParticipants: z.number().int().positive(),
  price: z.number().nonnegative(),
  fullPlan: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  transport: z.string().min(1),
  images: z.array(z.string()).max(10).default([]),
  video: z.string().optional(),
  isClosed: z.boolean().default(false),
  isDraft: z.boolean().default(false),
})

async function enrichTrip(trip: Trip) {
  const creator = await prisma.user.findUnique({ where: { id: trip.creatorId } })
  const dbTrip = toDbTrip(trip)
  return {
    ...dbTrip,
    creatorName: creator ? creatorLabel(creator) : 'Неизвестно',
    creatorAvatar: creator?.avatar ?? '',
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
  })

  if (search) {
    trips = trips.filter(
      (t) =>
        t.location.toLowerCase().includes(search) ||
        t.shortDescription.toLowerCase().includes(search) ||
        t.transport.toLowerCase().includes(search),
    )
  }

  res.json(await Promise.all(trips.map(enrichTrip)))
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
  res.json(await enrichTrip(trip))
}))

router.post('/', authRequired, asyncHandler(async (req, res) => {
  const data = tripSchema.parse(req.body)
  const trip = await prisma.trip.create({
    data: {
      id: uuid(),
      creatorId: req.userId!,
      location: data.location,
      locationType: detectLocationType(data.location),
      shortDescription: data.shortDescription,
      fullPlan: data.fullPlan,
      maxParticipants: data.maxParticipants,
      freeSpots: data.maxParticipants,
      price: data.price,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      transport: data.transport,
      images: data.images.length ? data.images : [unsplash('1488646953015-85cb44e25828')],
      video: data.video,
      isClosed: data.isClosed,
      isDraft: data.isDraft,
    },
  })
  await createTripConversation(trip.id)
  res.status(201).json(await enrichTrip(trip))
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
  res.json({ message: 'Вы записаны на поездку', trip: await enrichTrip(updatedTrip) })
}))

export default router
