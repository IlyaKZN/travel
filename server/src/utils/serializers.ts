import type {
  Conversation,
  ConversationParticipant,
  Message,
  Post,
  Tour,
  Trip,
  User,
} from '@prisma/client'
import type {
  DbConversation,
  DbMessage,
  DbPost,
  DbTour,
  DbTrip,
  DbUser,
  ConversationType,
  LocationType,
} from '../types/index.js'

export function toDbUser(user: User): DbUser {
  return {
    id: user.id,
    contact: user.contact,
    passwordHash: user.passwordHash,
    nickname: user.nickname,
    firstName: user.firstName,
    lastName: user.lastName,
    patronymic: user.patronymic ?? undefined,
    birthDate: user.birthDate,
    avatar: user.avatar,
    about: user.about ?? undefined,
    showTours: user.showTours,
    following: user.following,
    followers: user.followers,
    profileComplete: user.profileComplete,
    createdAt: user.createdAt.toISOString(),
  }
}

export function toDbPost(post: Post): DbPost {
  return {
    id: post.id,
    userId: post.userId,
    text: post.text,
    image: post.image ?? undefined,
    views: post.views,
    likes: post.likes,
    createdAt: post.createdAt.toISOString(),
  }
}

export function toDbTour(tour: Tour): DbTour {
  return {
    id: tour.id,
    creatorId: tour.creatorId,
    location: tour.location,
    locationType: tour.locationType as LocationType,
    shortDescription: tour.shortDescription,
    fullPlan: tour.fullPlan,
    maxParticipants: tour.maxParticipants,
    freeSpots: tour.freeSpots,
    price: tour.price,
    startDate: tour.startDate.toISOString(),
    endDate: tour.endDate.toISOString(),
    images: tour.images,
    video: tour.video ?? undefined,
    isClosed: tour.isClosed,
    isDraft: tour.isDraft,
    createdAt: tour.createdAt.toISOString(),
  }
}

export function toDbTrip(trip: Trip): DbTrip {
  return {
    id: trip.id,
    creatorId: trip.creatorId,
    location: trip.location,
    locationType: trip.locationType as LocationType,
    shortDescription: trip.shortDescription,
    fullPlan: trip.fullPlan,
    maxParticipants: trip.maxParticipants,
    freeSpots: trip.freeSpots,
    price: trip.price,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    transport: trip.transport,
    images: trip.images,
    video: trip.video ?? undefined,
    isClosed: trip.isClosed,
    isDraft: trip.isDraft,
    createdAt: trip.createdAt.toISOString(),
  }
}

type ConversationWithParticipants = Conversation & {
  participants: ConversationParticipant[]
}

export function toDbConversation(conversation: ConversationWithParticipants): DbConversation {
  return {
    id: conversation.id,
    type: conversation.type as ConversationType,
    tripId: conversation.tripId ?? undefined,
    participantIds: conversation.participants.map((p) => p.userId),
    createdAt: conversation.createdAt.toISOString(),
    lastMessageAt: conversation.lastMessageAt.toISOString(),
    lastMessageText: conversation.lastMessageText ?? undefined,
  }
}

export function toDbMessage(message: Message): DbMessage {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    text: message.text,
    createdAt: message.createdAt.toISOString(),
  }
}

export const conversationInclude = {
  participants: true,
} as const
