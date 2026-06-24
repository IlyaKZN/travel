export interface User {
  id: string
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
  profileComplete?: boolean
}

export interface Post {
  id: string
  userId: string
  text: string
  image?: string
  views: number
  likes: number
  createdAt: string
}

export interface Tour {
  id: string
  creatorId: string
  creatorName: string
  creatorAvatar: string
  location: string
  locationType: 'city' | 'festival' | 'nature'
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
}

export interface Trip {
  id: string
  tripNumber?: number
  creatorId: string
  creatorName: string
  creatorAvatar: string
  location: string
  locationType: 'city' | 'festival' | 'nature'
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
}

export interface AuthForm {
  contact: string
  password: string
  remember?: boolean
}

export interface ProfileForm {
  nickname: string
  lastName: string
  firstName: string
  patronymic?: string
  birthDate: string
  avatar?: string
  about?: string
}

export interface TourForm {
  location: string
  shortDescription: string
  maxParticipants: number
  price: number
  fullPlan: string
  startDate: string
  endDate: string
  images: string[]
  video?: string
  isClosed: boolean
}

export interface TripForm extends TourForm {
  transport: string
}

export interface ChatUser {
  id: string
  nickname: string
  firstName: string
  lastName: string
  avatar: string
}

export interface Conversation {
  id: string
  type: 'dm' | 'trip'
  title: string
  subtitle?: string
  avatar?: string
  tripId?: string
  otherUser?: ChatUser
  participantIds: string[]
  participantCount?: number
  lastMessage?: string
  lastMessageAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
  senderName: string
  senderAvatar: string
  senderNickname: string
}
