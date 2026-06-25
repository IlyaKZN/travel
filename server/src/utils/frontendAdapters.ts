import type { DbUser } from '../types/index.js'

export type FrontendTransport = 'car' | 'train' | 'bus' | 'plane'

const transportMap: Record<string, FrontendTransport> = {
  car: 'car',
  авто: 'car',
  автомобиль: 'car',
  machine: 'car',
  train: 'train',
  поезд: 'train',
  bus: 'bus',
  автобус: 'bus',
  plane: 'plane',
  самолет: 'plane',
  самолёт: 'plane',
}

const avatarPalette = ['#C2614A', '#7D9B76', '#E8A87C', '#8B6F5E', '#4A6741', '#B8754B']

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function avatarColor(seed: string): string {
  return avatarPalette[hashString(seed) % avatarPalette.length]
}

export function normalizeTransport(value: string): FrontendTransport {
  return transportMap[value.trim().toLowerCase()] ?? 'car'
}

export function splitTripLocation(location: string): { from: string; to: string } {
  const normalized = location.trim()
  const arrowMatch = normalized.split(/\s*(?:→|->|—|–)\s*/)
  if (arrowMatch.length >= 2 && arrowMatch[0] && arrowMatch[1]) {
    return { from: arrowMatch[0], to: arrowMatch.slice(1).join(' → ') }
  }

  const [city] = normalized.split(',').map((part) => part.trim()).filter(Boolean)
  return { from: 'Москва', to: city || normalized || 'Маршрут' }
}

export function publicFrontendUser(user: DbUser) {
  const displayName = user.firstName || user.nickname || 'Пользователь'
  const createdAt = new Date(user.createdAt)

  return {
    id: user.id,
    nickname: user.nickname,
    firstName: displayName,
    lastName: user.lastName,
    avatarColor: avatarColor(user.avatar || user.id),
    bio: user.about ?? '',
    location: user.patronymic ?? '',
    joinedYear: Number.isNaN(createdAt.getTime()) ? new Date().getFullYear() : createdAt.getFullYear(),
    email: user.contact,
  }
}
