export type LocationType = 'city' | 'festival' | 'nature'

export interface DbUser {
  id: string
  contact: string
  passwordHash: string
  nickname: string
  firstName: string
  lastName: string
  patronymic?: string
  birthDate: string
  avatar: string
  about?: string
  showTours: boolean
  following: number
  followers: number
  profileComplete: boolean
  createdAt: string
}

export interface PendingUser {
  contact: string
  passwordHash: string
  confirmCode: string
  expiresAt: string
}

export interface DbPost {
  id: string
  userId: string
  text: string
  image?: string
  views: number
  likes: number
  createdAt: string
}

export interface DbTour {
  id: string
  creatorId: string
  location: string
  locationType: LocationType
  shortDescription: string
  fullPlan: string
  maxParticipants: number
  freeSpots: number
  price: number
  startDate: string
  endDate: string
  images: string[]
  video?: string
  isClosed: boolean
  isDraft: boolean
  createdAt: string
}

export interface DbTrip {
  id: string
  creatorId: string
  location: string
  locationType: LocationType
  shortDescription: string
  fullPlan: string
  maxParticipants: number
  freeSpots: number
  price: number
  startDate: string
  endDate: string
  transport: string
  images: string[]
  video?: string
  isClosed: boolean
  isDraft: boolean
  createdAt: string
}

export type ConversationType = 'dm' | 'trip'

export interface DbConversation {
  id: string
  type: ConversationType
  tripId?: string
  participantIds: string[]
  participantUsers?: DbUser[]
  createdAt: string
  lastMessageAt: string
  lastMessageText?: string
}

export interface DbMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

export interface Database {
  users: DbUser[]
  pendingUsers: PendingUser[]
  posts: DbPost[]
  tours: DbTour[]
  trips: DbTrip[]
  tourSignups: { tourId: string; userId: string }[]
  tripSignups: { tripId: string; userId: string }[]
  conversations: DbConversation[]
  messages: DbMessage[]
}

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}
