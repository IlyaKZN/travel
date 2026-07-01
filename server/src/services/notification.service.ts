import { v4 as uuid } from 'uuid'
import type { NotificationKind, Trip } from '@prisma/client'
import { prisma } from '../lib/prisma.js'
import { splitTripLocation } from '../utils/frontendAdapters.js'

function formatBudgetRub(value: number) {
  if (!value) return 'бесплатно'
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`
}

export async function createNotification(data: {
  userId: string
  kind: NotificationKind
  tripId: string
  actorId?: string
  changeSummary?: string
}) {
  return prisma.notification.create({
    data: {
      id: uuid(),
      userId: data.userId,
      kind: data.kind,
      tripId: data.tripId,
      actorId: data.actorId,
      changeSummary: data.changeSummary,
    },
  })
}

export function buildTripChangeSummary(before: Trip, after: {
  location: string
  startDate: Date
  endDate: Date
  price: number
  maxParticipants: number
}): string | undefined {
  const changes: string[] = []
  const oldRoute = splitTripLocation(before.location)
  const newRoute = splitTripLocation(after.location)
  if (before.location !== after.location) {
    changes.push(`Маршрут: ${oldRoute.from} → ${oldRoute.to} → ${newRoute.from} → ${newRoute.to}`)
  }
  if (before.startDate.getTime() !== after.startDate.getTime()) {
    const fmt = (d: Date) =>
      d.toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    changes.push(`Время выезда: ${fmt(before.startDate)} → ${fmt(after.startDate)}`)
  }
  if (before.price !== after.price) {
    changes.push(`Бюджет: ${formatBudgetRub(before.price)} → ${formatBudgetRub(after.price)}`)
  }
  if (before.maxParticipants !== after.maxParticipants) {
    changes.push(`Мест: ${before.maxParticipants} → ${after.maxParticipants}`)
  }
  return changes.length ? changes.join(' · ') : undefined
}

export async function notifyTripParticipantsUpdated(tripId: string, organizerId: string, summary?: string) {
  if (!summary) return
  const signups = await prisma.tripSignup.findMany({ where: { tripId }, select: { userId: true } })
  const recipientIds = signups.map((s) => s.userId).filter((id) => id !== organizerId)
  await Promise.all(
    recipientIds.map((userId) =>
      createNotification({
        userId,
        kind: 'trip_updated',
        tripId,
        actorId: organizerId,
        changeSummary: summary,
      }),
    ),
  )
}
