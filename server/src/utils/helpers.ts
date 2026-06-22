import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { DbUser } from '../types/index.js'
import { config } from '../config.js'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as { sub: string }
    return { userId: payload.sub }
  } catch {
    return null
  }
}

export function generateConfirmCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function publicUser(user: DbUser) {
  return {
    id: user.id,
    nickname: user.nickname,
    firstName: user.firstName,
    lastName: user.lastName,
    patronymic: user.patronymic,
    birthDate: user.birthDate,
    avatar: user.avatar,
    about: user.about,
    showTours: user.showTours,
    following: user.following,
    followers: user.followers,
    profileComplete: user.profileComplete,
  }
}

export function creatorLabel(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName[0]}.`
}

export function detectLocationType(location: string): 'city' | 'festival' | 'nature' {
  const lower = location.toLowerCase()
  if (lower.includes('фестиваль') || lower.includes('архстояние')) return 'festival'
  if (
    lower.includes('байкал') ||
    lower.includes('карел') ||
    lower.includes('алтай') ||
    lower.includes('камчат') ||
    lower.includes('каньон') ||
    lower.includes('природ')
  ) {
    return 'nature'
  }
  return 'city'
}

export function unsplash(id: string, w = 800, h = 500): string {
  return `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&q=80&auto=format`
}

export function unsplashAvatar(id: string, size = 150): string {
  return `https://images.unsplash.com/photo-${id}?w=${size}&h=${size}&fit=crop&crop=faces&q=80&auto=format`
}
