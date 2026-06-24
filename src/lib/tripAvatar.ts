const AVATAR_COLORS = [
  { bg: '#F97316', text: '#FFFFFF' },
  { bg: '#8B5CF6', text: '#FFFFFF' },
  { bg: '#0EA5E9', text: '#FFFFFF' },
  { bg: '#10B981', text: '#FFFFFF' },
  { bg: '#EC4899', text: '#FFFFFF' },
  { bg: '#6366F1', text: '#FFFFFF' },
  { bg: '#14B8A6', text: '#FFFFFF' },
  { bg: '#F59E0B', text: '#FFFFFF' },
] as const

function hashRoute(from: string, to: string): number {
  const key = `${from}|${to}`
  let hash = 0
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  }
  return hash
}

export function getTripAvatarColors(from: string, to: string) {
  return AVATAR_COLORS[hashRoute(from, to) % AVATAR_COLORS.length]
}

export function getTripAvatarLetters(fromShort: string, toShort: string): string {
  const fromLetter = fromShort.charAt(0) || '?'
  const toLetter = toShort.charAt(0) || '?'
  return `${fromLetter}${toLetter}`
}
