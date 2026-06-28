import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import type { Tour } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { toDbTour } from '../utils/serializers.js'
import { authOptional, authRequired } from '../middleware/auth.js'
import { creatorLabel, detectLocationType, unsplash } from '../utils/helpers.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'
import { emitTourChanged } from '../ws/chat.js'

const router = Router()

const tourSchema = z.object({
  location: z.string().min(1),
  shortDescription: z.string().min(1),
  maxParticipants: z.number().int().positive(),
  price: z.number().nonnegative(),
  fullPlan: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  images: z.array(z.string()).max(10).default([]),
  video: z.string().optional(),
  isClosed: z.boolean().default(false),
  isDraft: z.boolean().default(false),
})

async function enrichTour(tour: Tour) {
  const creator = await prisma.user.findUnique({ where: { id: tour.creatorId } })
  const dbTour = toDbTour(tour)
  return {
    ...dbTour,
    creatorName: creator ? creatorLabel(creator) : 'Неизвестно',
    creatorAvatar: creator?.avatar ?? '',
  }
}

router.get('/', authOptional, asyncHandler(async (req, res) => {
  const search = (req.query.search as string)?.toLowerCase() ?? ''
  const locationType = req.query.locationType as string | undefined
  const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined
  const creatorId = req.query.creatorId as string | undefined

  let tours = await prisma.tour.findMany({
    where: {
      isDraft: false,
      ...(locationType ? { locationType: locationType as 'city' | 'festival' | 'nature' } : {}),
      ...(creatorId ? { creatorId } : {}),
      ...(maxPrice !== undefined && !Number.isNaN(maxPrice) ? { price: { lte: maxPrice } } : {}),
    },
  })

  if (search) {
    tours = tours.filter(
      (t) =>
        t.location.toLowerCase().includes(search) ||
        t.shortDescription.toLowerCase().includes(search),
    )
  }

  res.json(await Promise.all(tours.map(enrichTour)))
}))

router.get('/:id', asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const tour = await prisma.tour.findFirst({
    where: { id, isDraft: false },
  })
  if (!tour) {
    res.status(404).json({ error: 'Тур не найден' })
    return
  }
  res.json(await enrichTour(tour))
}))

router.post('/', authRequired, asyncHandler(async (req, res) => {
  const data = tourSchema.parse(req.body)
  const tour = await prisma.tour.create({
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
      images: data.images.length ? data.images : [unsplash('1476514529935-07be3d397c4b')],
      video: data.video,
      isClosed: data.isClosed,
      isDraft: data.isDraft,
    },
  })
  if (!tour.isDraft) {
    emitTourChanged('created', tour.id)
  }
  res.status(201).json(await enrichTour(tour))
}))

router.post('/:id/signup', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const tour = await prisma.tour.findUnique({ where: { id } })
  if (!tour) {
    res.status(404).json({ error: 'Тур не найден' })
    return
  }
  if (tour.freeSpots <= 0) {
    res.status(400).json({ error: 'Нет свободных мест' })
    return
  }

  const already = await prisma.tourSignup.findUnique({
    where: { tourId_userId: { tourId: tour.id, userId: req.userId! } },
  })
  if (already) {
    res.status(409).json({ error: 'Вы уже записаны' })
    return
  }

  const [, updatedTour] = await prisma.$transaction([
    prisma.tourSignup.create({
      data: { tourId: tour.id, userId: req.userId! },
    }),
    prisma.tour.update({
      where: { id: tour.id },
      data: { freeSpots: { decrement: 1 } },
    }),
  ])

  emitTourChanged('updated', updatedTour.id)
  res.json({ message: 'Вы записаны на тур', tour: await enrichTour(updatedTour) })
}))

export default router
