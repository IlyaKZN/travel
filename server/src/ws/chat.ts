import type { WebSocket } from 'ws'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { conversationInclude, toDbConversation } from '../utils/serializers.js'
import {
  enrichConversation,
  enrichMessage,
  sendMessage,
} from '../services/chat.service.js'
import { verifyToken } from '../utils/helpers.js'

export interface ChatClient {
  ws: WebSocket
  userId: string
  conversationId?: string
}

const clients = new Set<ChatClient>()

type AppEvent =
  | { type: 'trip_changed'; action: 'created' | 'updated' | 'request_created' | 'request_cancelled' | 'request_declined'; tripId: string }
  | { type: 'tour_changed'; action: 'created' | 'updated'; tourId: string }
  | { type: 'post_changed'; action: 'created' | 'updated' | 'deleted'; postId: string; userId: string }
  | { type: 'user_changed'; userId: string }
  | { type: 'review_created'; userId: string; reviewId: string }

const joinSchema = z.object({
  type: z.literal('join'),
  conversationId: z.string(),
})

const sendSchema = z.object({
  type: z.literal('send'),
  text: z.string().min(1).max(2000),
})

const leaveSchema = z.object({
  type: z.literal('leave'),
})

function sendJson(ws: WebSocket, data: unknown) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(data))
  }
}

function sendError(ws: WebSocket, message: string) {
  sendJson(ws, { type: 'error', message })
}

async function getConversationMessages(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })
  return Promise.all(
    messages.map((m) =>
      enrichMessage({
        id: m.id,
        conversationId: m.conversationId,
        senderId: m.senderId,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
      }),
    ),
  )
}

function broadcastAppEvent(data: AppEvent, recipientIds?: string[]) {
  for (const client of clients) {
    if (
      (!recipientIds || recipientIds.includes(client.userId)) &&
      client.ws.readyState === client.ws.OPEN
    ) {
      sendJson(client.ws, data)
    }
  }
}

function broadcastToJoinedRoom(conversationId: string, participantIds: string[], data: unknown) {
  for (const client of clients) {
    if (
      client.conversationId === conversationId &&
      participantIds.includes(client.userId) &&
      client.ws.readyState === client.ws.OPEN
    ) {
      sendJson(client.ws, data)
    }
  }
}

function findConversationWithParticipants(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  })
}

type ConversationWithParticipants = NonNullable<Awaited<ReturnType<typeof findConversationWithParticipants>>>

async function broadcastConversationUpdated(conversation: ConversationWithParticipants | null) {
  if (!conversation) return

  const participantIds = conversation.participants.map((p) => p.userId)
  const dbConversation = toDbConversation(conversation)

  await Promise.all(
    [...clients]
      .filter((client) => participantIds.includes(client.userId) && client.ws.readyState === client.ws.OPEN)
      .map(async (client) => {
        sendJson(client.ws, {
          type: 'conversation_updated',
          conversation: await enrichConversation(dbConversation, client.userId),
        })
      }),
  )
}

export async function emitConversationUpdated(conversationId: string) {
  const conversation = await findConversationWithParticipants(conversationId)
  await broadcastConversationUpdated(conversation)
}

export async function emitChatMessage(conversationId: string, message: Awaited<ReturnType<typeof sendMessage>>) {
  const conversation = await findConversationWithParticipants(conversationId)
  if (!conversation) return

  const participantIds = conversation.participants.map((p) => p.userId)
  broadcastToJoinedRoom(conversationId, participantIds, {
    type: 'message',
    message: await enrichMessage(message),
  })
  await broadcastConversationUpdated(conversation)
}

export function emitTripChanged(
  action: Extract<AppEvent, { type: 'trip_changed' }>['action'],
  tripId: string,
  recipientIds?: string[],
) {
  broadcastAppEvent({ type: 'trip_changed', action, tripId }, recipientIds)
}

export function emitTourChanged(
  action: Extract<AppEvent, { type: 'tour_changed' }>['action'],
  tourId: string,
  recipientIds?: string[],
) {
  broadcastAppEvent({ type: 'tour_changed', action, tourId }, recipientIds)
}

export function emitPostChanged(
  action: Extract<AppEvent, { type: 'post_changed' }>['action'],
  postId: string,
  userId: string,
  recipientIds?: string[],
) {
  broadcastAppEvent({ type: 'post_changed', action, postId, userId }, recipientIds)
}

export function emitUserChanged(userId: string, recipientIds?: string[]) {
  broadcastAppEvent({ type: 'user_changed', userId }, recipientIds)
}

export function emitReviewCreated(userId: string, reviewId: string, recipientIds?: string[]) {
  broadcastAppEvent({ type: 'review_created', userId, reviewId }, recipientIds)
}

async function handleJoin(client: ChatClient, conversationId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  })
  if (!conversation || !conversation.participants.some((p) => p.userId === client.userId)) {
    sendError(client.ws, 'Чат не найден или нет доступа')
    return
  }

  client.conversationId = conversationId
  const dbConversation = toDbConversation(conversation)
  sendJson(client.ws, {
    type: 'joined',
    conversation: await enrichConversation(dbConversation, client.userId),
    messages: await getConversationMessages(conversationId),
  })
}

async function handleSend(client: ChatClient, text: string) {
  if (!client.conversationId) {
    sendError(client.ws, 'Сначала подключитесь к чату')
    return
  }

  try {
    const message = await sendMessage(client.conversationId, client.userId, text)
    await emitChatMessage(client.conversationId, message)
  } catch (e) {
    if (e instanceof Error && e.message === 'NOT_FOUND') {
      sendError(client.ws, 'Чат не найден')
      return
    }
    if (e instanceof Error && e.message === 'FORBIDDEN') {
      sendError(client.ws, 'Нет доступа к чату')
      return
    }
    sendError(client.ws, 'Не удалось отправить сообщение')
  }
}

function handleMessage(client: ChatClient, raw: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    sendError(client.ws, 'Некорректный формат сообщения')
    return
  }

  const join = joinSchema.safeParse(parsed)
  if (join.success) {
    void handleJoin(client, join.data.conversationId)
    return
  }

  const send = sendSchema.safeParse(parsed)
  if (send.success) {
    void handleSend(client, send.data.text)
    return
  }

  const leave = leaveSchema.safeParse(parsed)
  if (leave.success) {
    client.conversationId = undefined
    return
  }

  sendError(client.ws, 'Неизвестный тип сообщения')
}

export function setupChatWebSocket() {
  return {
    handleConnection(ws: WebSocket, token: string | null) {
      if (!token) {
        ws.close(4401, 'Unauthorized')
        return
      }

      const payload = verifyToken(token)
      if (!payload) {
        ws.close(4401, 'Unauthorized')
        return
      }

      const client: ChatClient = { ws, userId: payload.userId }
      clients.add(client)

      ws.on('message', (data) => {
        handleMessage(client, data.toString())
      })

      ws.on('close', () => {
        clients.delete(client)
      })

      ws.on('error', () => {
        clients.delete(client)
      })

      sendJson(ws, { type: 'connected', userId: payload.userId })
    },
  }
}
