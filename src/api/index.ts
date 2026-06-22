import { api, setPendingContact, setToken } from './client'
import type { User } from '@/types'

interface AuthResponse {
  token: string
  user: User & { profileComplete?: boolean }
  needsProfile?: boolean
}

export const authApi = {
  register(contact: string, password: string) {
    return api<{ message: string; contact: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ contact, password }),
    }).then((res) => {
      setPendingContact(res.contact)
      return res
    })
  },

  confirm(contact: string, code: string) {
    return api<AuthResponse>('/auth/confirm', {
      method: 'POST',
      body: JSON.stringify({ contact, code }),
    }).then((res) => {
      setToken(res.token)
      setPendingContact(null)
      return res
    })
  },

  resendCode(contact: string) {
    return api<{ message: string }>('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ contact }),
    })
  },

  login(contact: string, password: string) {
    return api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ contact, password }),
    }).then((res) => {
      setToken(res.token)
      return res
    })
  },

  resetPassword(contact: string, password: string) {
    return api<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ contact, password }),
    })
  },

  me() {
    return api<User>('/auth/me')
  },
}

export const usersApi = {
  createProfile(data: {
    nickname: string
    firstName: string
    lastName: string
    patronymic?: string
    birthDate: string
    avatar?: string
    about?: string
  }) {
    return api<User>('/users/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  updateSettings(data: Partial<Pick<User, 'nickname' | 'avatar' | 'about' | 'showTours'>>) {
    return api<User>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },
}

export const postsApi = {
  list(userId?: string) {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : ''
    return api<import('@/types').Post[]>(`/posts${q}`)
  },

  create(data: { text: string; image?: string }) {
    return api<import('@/types').Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update(id: string, data: { text: string; image?: string }) {
    return api<import('@/types').Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  delete(id: string) {
    return api<{ message: string }>(`/posts/${id}`, { method: 'DELETE' })
  },
}

export const toursApi = {
  list(params?: { search?: string; locationType?: string; maxPrice?: number | null; creatorId?: string }) {
    const sp = new URLSearchParams()
    if (params?.search) sp.set('search', params.search)
    if (params?.locationType) sp.set('locationType', params.locationType)
    if (params?.maxPrice) sp.set('maxPrice', String(params.maxPrice))
    if (params?.creatorId) sp.set('creatorId', params.creatorId)
    const q = sp.toString() ? `?${sp}` : ''
    return api<import('@/types').Tour[]>(`/tours${q}`)
  },

  get(id: string) {
    return api<import('@/types').Tour>(`/tours/${id}`)
  },

  create(data: Record<string, unknown>) {
    return api<import('@/types').Tour>('/tours', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  signup(id: string) {
    return api<{ message: string }>(`/tours/${id}/signup`, { method: 'POST' })
  },
}

export const tripsApi = {
  list(params?: { search?: string; locationType?: string; maxPrice?: number | null; creatorId?: string }) {
    const sp = new URLSearchParams()
    if (params?.search) sp.set('search', params.search)
    if (params?.locationType) sp.set('locationType', params.locationType)
    if (params?.maxPrice) sp.set('maxPrice', String(params.maxPrice))
    if (params?.creatorId) sp.set('creatorId', params.creatorId)
    const q = sp.toString() ? `?${sp}` : ''
    return api<import('@/types').Trip[]>(`/trips${q}`)
  },

  get(id: string) {
    return api<import('@/types').Trip>(`/trips/${id}`)
  },

  create(data: Record<string, unknown>) {
    return api<import('@/types').Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  signup(id: string) {
    return api<{ message: string }>(`/trips/${id}/signup`, { method: 'POST' })
  },
}

export const chatsApi = {
  list() {
    return api<import('@/types').Conversation[]>('/chats')
  },

  get(id: string) {
    return api<import('@/types').Conversation>(`/chats/${id}`)
  },

  searchUsers(search?: string) {
    const q = search ? `?search=${encodeURIComponent(search)}` : ''
    return api<import('@/types').ChatUser[]>(`/chats/users${q}`)
  },

  openDm(userId: string) {
    return api<import('@/types').Conversation>(`/chats/dm/${userId}`, { method: 'POST' })
  },

  openTripChat(tripId: string) {
    return api<import('@/types').Conversation>(`/chats/trip/${tripId}`)
  },

  getMessages(conversationId: string, after?: string) {
    const q = after ? `?after=${encodeURIComponent(after)}` : ''
    return api<import('@/types').ChatMessage[]>(`/chats/${conversationId}/messages${q}`)
  },

  sendMessage(conversationId: string, text: string) {
    return api<import('@/types').ChatMessage>(`/chats/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    })
  },
}
