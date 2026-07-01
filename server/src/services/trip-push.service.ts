import { prisma } from '../lib/prisma.js'
import { config } from '../config.js'
import { splitTripLocation } from '../utils/frontendAdapters.js'
import { isUserOnline } from '../ws/chat.js'
import { sendPushToUser } from './push.service.js'

function tripUrl(tripId: string) {
  return `${config.appPublicUrl}/trip/${tripId}`
}

function displayName(user: { firstName: string; nickname: string }) {
  return user.firstName || user.nickname || 'Пользователь'
}

export async function notifyOrganizerJoinRequest(tripId: string, requesterId: string) {
  const [trip, requester] = await Promise.all([
    prisma.trip.findUnique({ where: { id: tripId } }),
    prisma.user.findUnique({ where: { id: requesterId } }),
  ])
  if (!trip || !requester) return
  if (isUserOnline(trip.creatorId)) return

  const { from, to } = splitTripLocation(trip.location)
  await sendPushToUser(trip.creatorId, {
    title: 'Новая заявка на поездку',
    body: `${displayName(requester)} хочет присоединиться: ${from} → ${to}`,
    url: tripUrl(tripId),
    tag: `trip-request-${tripId}`,
  })
}

export async function notifyCompanionRequestApproved(tripId: string, companionId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return
  if (isUserOnline(companionId)) return

  const { from, to } = splitTripLocation(trip.location)
  await sendPushToUser(companionId, {
    title: 'Заявка принята',
    body: `Организатор принял вашу заявку: ${from} → ${to}`,
    url: tripUrl(tripId),
    tag: `trip-approved-${tripId}`,
  })
}

export async function notifyCompanionRequestDeclined(tripId: string, companionId: string) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return
  if (isUserOnline(companionId)) return

  const { from, to } = splitTripLocation(trip.location)
  await sendPushToUser(companionId, {
    title: 'Заявка отклонена',
    body: `Организатор отклонил вашу заявку: ${from} → ${to}`,
    url: tripUrl(tripId),
    tag: `trip-declined-${tripId}`,
  })
}
