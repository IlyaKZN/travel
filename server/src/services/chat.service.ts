import { v4 as uuid } from 'uuid'
import { prisma } from '../lib/prisma.js'
import {
  conversationInclude,
  toDbConversation,
  toDbMessage,
  toDbUser,
} from '../utils/serializers.js'
import type { DbConversation, DbMessage, DbUser } from '../types/index.js'
import { avatarColor, publicFrontendUser, splitTripLocation } from '../utils/frontendAdapters.js'

export async function isTripParticipant(tripId: string, userId: string): Promise<boolean> {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip) return false
  if (trip.creatorId === userId) return true
  const signup = await prisma.tripSignup.findUnique({
    where: { tripId_userId: { tripId, userId } },
  })
  return !!signup
}

export async function getTripParticipantIds(tripId: string): Promise<string[]> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { signups: true },
  })
  if (!trip) return []
  const ids = new Set<string>([trip.creatorId])
  trip.signups.forEach((s) => ids.add(s.userId))
  return [...ids]
}

export async function findDmConversation(
  userA: string,
  userB: string,
): Promise<DbConversation | undefined> {
  const conversations = await prisma.conversation.findMany({
    where: {
      type: 'dm',
      AND: [
        { participants: { some: { userId: userA } } },
        { participants: { some: { userId: userB } } },
      ],
    },
    include: conversationInclude,
  })

  const match = conversations.find((c) => c.participants.length === 2)
  return match ? toDbConversation(match) : undefined
}

export async function findTripConversation(tripId: string): Promise<DbConversation | undefined> {
  const conversation = await prisma.conversation.findUnique({
    where: { tripId },
    include: conversationInclude,
  })
  return conversation ? toDbConversation(conversation) : undefined
}

export async function createTripConversation(tripId: string): Promise<DbConversation> {
  const existing = await findTripConversation(tripId)
  if (existing) return existing

  const participantIds = await getTripParticipantIds(tripId)
  const now = new Date()

  const conversation = await prisma.conversation.create({
    data: {
      type: 'trip',
      tripId,
      lastMessageAt: now,
      participants: {
        create: participantIds.map((userId) => ({ userId })),
      },
    },
    include: conversationInclude,
  })

  return toDbConversation(conversation)
}

export async function addUserToTripChat(tripId: string, userId: string) {
  let conversation = await prisma.conversation.findUnique({
    where: { tripId },
    include: conversationInclude,
  })

  if (!conversation) {
    await createTripConversation(tripId)
    conversation = await prisma.conversation.findUnique({
      where: { tripId },
      include: conversationInclude,
    })
  }

  if (!conversation) return

  const exists = conversation.participants.some((p) => p.userId === userId)
  if (!exists) {
    await prisma.conversationParticipant.create({
      data: { conversationId: conversation.id, userId },
    })
  }
}

export async function getOrCreateDm(userId: string, targetUserId: string): Promise<DbConversation> {
  if (userId === targetUserId) {
    throw new Error('SELF_DM')
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!target) {
    throw new Error('USER_NOT_FOUND')
  }

  const existing = await findDmConversation(userId, targetUserId)
  if (existing) return existing

  const now = new Date()
  const conversation = await prisma.conversation.create({
    data: {
      type: 'dm',
      lastMessageAt: now,
      participants: {
        create: [{ userId }, { userId: targetUserId }],
      },
    },
    include: conversationInclude,
  })

  return toDbConversation(conversation)
}

export async function getOrCreateTripChat(tripId: string, userId: string): Promise<DbConversation> {
  if (!(await isTripParticipant(tripId, userId))) {
    throw new Error('FORBIDDEN')
  }

  let conversation = await findTripConversation(tripId)
  if (!conversation) {
    conversation = await createTripConversation(tripId)
  }

  const current = await getTripParticipantIds(tripId)
  const missing = current.filter((id) => !conversation!.participantIds.includes(id))

  if (missing.length > 0) {
    await prisma.conversationParticipant.createMany({
      data: missing.map((uid) => ({
        conversationId: conversation!.id,
        userId: uid,
      })),
      skipDuplicates: true,
    })
    const updated = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: conversationInclude,
    })
    if (updated) conversation = toDbConversation(updated)
  }

  return conversation
}

async function countUnreadMessages(conversationId: string, currentUserId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: currentUserId } },
    select: { lastReadAt: true },
  })

  return prisma.message.count({
    where: {
      conversationId,
      senderId: { not: currentUserId },
      ...(participant ? { createdAt: { gt: participant.lastReadAt } } : {}),
    },
  })
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
  readAt = new Date(),
) {
  const result = await prisma.conversationParticipant.updateMany({
    where: { conversationId, userId },
    data: { lastReadAt: readAt },
  })

  return result.count > 0
}

export async function markConversationReadForUsers(
  conversationId: string,
  userIds: string[],
  readAt = new Date(),
) {
  if (userIds.length === 0) return

  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId,
      userId: { in: [...new Set(userIds)] },
    },
    data: { lastReadAt: readAt },
  })
}

export async function enrichConversation(conversation: DbConversation, currentUserId: string) {
  const unread = await countUnreadMessages(conversation.id, currentUserId)
  const participants = conversation.participantUsers?.map(publicFrontendUser) ?? []

  if (conversation.type === 'trip' && conversation.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: conversation.tripId } })
    const route = trip ? splitTripLocation(trip.location) : null
    const title = route ? `${route.from} → ${route.to}` : 'Чат поездки'
    return {
      id: conversation.id,
      kind: 'group',
      tripId: conversation.tripId,
      title,
      participantIds: conversation.participantIds,
      participants,
      preview: conversation.lastMessageText ?? 'Пока нет сообщений',
      unread,
      lastAt: conversation.lastMessageAt,
    }
  }

  const otherId = conversation.participantIds.find((id) => id !== currentUserId)
  const otherFromDb = otherId && participants.length === 0 ? await prisma.user.findUnique({ where: { id: otherId } }) : null
  const other =
    participants.find((user) => user.id === otherId) ??
    (otherFromDb ? publicFrontendUser(toDbUser(otherFromDb)) : undefined)

  return {
    id: conversation.id,
    kind: 'dm',
    title: other ? `${other.firstName} ${other.lastName}`.trim() || `@${other.nickname}` : 'Личные сообщения',
    otherUser: other,
    participantIds: conversation.participantIds,
    participants,
    preview: conversation.lastMessageText ?? 'Пока нет сообщений',
    unread,
    lastAt: conversation.lastMessageAt,
  }
}

export async function enrichMessage(message: DbMessage) {
  return {
    id: message.id,
    authorId: message.senderId,
    text: message.text,
    at: message.createdAt,
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string,
): Promise<DbMessage> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  })
  if (!conversation) throw new Error('NOT_FOUND')
  if (!conversation.participants.some((p) => p.userId === senderId)) {
    throw new Error('FORBIDDEN')
  }

  const trimmed = text.trim()
  const now = new Date()

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        id: uuid(),
        conversationId,
        senderId,
        text: trimmed,
        createdAt: now,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: now,
        lastMessageText: trimmed.slice(0, 120),
      },
    }),
    prisma.conversationParticipant.updateMany({
      where: { conversationId, userId: senderId },
      data: { lastReadAt: now },
    }),
  ])

  return toDbMessage(message)
}

export function publicUserBrief(user: DbUser) {
  return {
    id: user.id,
    nickname: user.nickname,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    avatarColor: avatarColor(user.avatar || user.id),
    bio: user.about ?? '',
  }
}
