import { v4 as uuid } from 'uuid'
import { prisma } from '../lib/prisma.js'
import {
  conversationInclude,
  toDbConversation,
  toDbMessage,
  toDbUser,
} from '../utils/serializers.js'
import type { DbConversation, DbMessage, DbUser } from '../types/index.js'

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

export async function enrichConversation(conversation: DbConversation, currentUserId: string) {
  if (conversation.type === 'trip' && conversation.tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: conversation.tripId } })
    return {
      id: conversation.id,
      type: conversation.type,
      tripId: conversation.tripId,
      title: trip ? `Поездка: ${trip.location}` : 'Чат поездки',
      subtitle: trip?.shortDescription,
      avatar: trip?.images[0],
      participantIds: conversation.participantIds,
      participantCount: conversation.participantIds.length,
      lastMessage: conversation.lastMessageText,
      lastMessageAt: conversation.lastMessageAt,
    }
  }

  const otherId = conversation.participantIds.find((id) => id !== currentUserId)
  const other = otherId ? await prisma.user.findUnique({ where: { id: otherId } }) : null

  return {
    id: conversation.id,
    type: conversation.type,
    title: other ? `@${other.nickname}` : 'Личные сообщения',
    subtitle: other ? `${other.firstName} ${other.lastName}` : undefined,
    avatar: other?.avatar,
    otherUser: other
      ? {
          id: other.id,
          nickname: other.nickname,
          firstName: other.firstName,
          lastName: other.lastName,
          avatar: other.avatar,
        }
      : undefined,
    participantIds: conversation.participantIds,
    lastMessage: conversation.lastMessageText,
    lastMessageAt: conversation.lastMessageAt,
  }
}

export async function enrichMessage(message: DbMessage) {
  const sender = await prisma.user.findUnique({ where: { id: message.senderId } })
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt,
    senderName: sender ? `${sender.firstName} ${sender.lastName[0]}.` : 'Пользователь',
    senderAvatar: sender?.avatar ?? '',
    senderNickname: sender?.nickname ?? '',
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

  const message = await prisma.message.create({
    data: {
      id: uuid(),
      conversationId,
      senderId,
      text: trimmed,
      createdAt: now,
    },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: now,
      lastMessageText: trimmed.slice(0, 120),
    },
  })

  return toDbMessage(message)
}

export function publicUserBrief(user: DbUser) {
  return {
    id: user.id,
    nickname: user.nickname,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  }
}
