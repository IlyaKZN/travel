const BASE = 'https://images.unsplash.com'

export interface UnsplashOptions {
  w?: number
  h?: number
  fit?: 'crop' | 'max' | 'clamp'
  crop?: 'faces' | 'entropy' | 'edges' | 'center'
  q?: number
}

/** Собирает URL картинки с CDN Unsplash */
export function unsplash(id: string, options: UnsplashOptions = {}): string {
  const { w = 800, h, fit = 'crop', crop, q = 80 } = options
  const params = new URLSearchParams({
    w: String(w),
    fit,
    q: String(q),
    auto: 'format',
  })
  if (h) params.set('h', String(h))
  if (crop) params.set('crop', crop)
  return `${BASE}/photo-${id}?${params}`
}

export function unsplashAvatar(id: string, size = 150): string {
  return unsplash(id, { w: size, h: size, fit: 'crop', crop: 'faces' })
}

/** Подборка фото по тематике путешествий */
export const photos = {
  baikal: '1551888775-22fb19f1082f',
  baikal2: '1506905925346-21bda4d32df4',
  kamchatka: '1501785888041-ca3a779714ca',
  altai: '1464822759023-fed622ff2c3b',
  kazan: '1514565837817-1a7db783a4d0',
  festival: '1533170492542-3d8f1e77401b',
  sochi: '1507525428034-b723cf961d3e',
  karelia: '1441974231531-c6227db76b6e',
  nnovgorod: '1480714378408-67c0d84e6e03',
  travel: '1469856833073-bb0237402594',
  mountains: '1506905925346-21bda4d32df4',
  defaultTour: '1476514529935-07be3d397c4b',
  defaultTrip: '1488646953015-85cb44e25828',
  defaultPost: '1501785888041-ca3a779714ca',
  placeholder: '1506905925346-21bda4d32df4',
} as const

export const avatars = {
  alex: '1507003211169-0a1dd7228f2d',
  maria: '1494790108377-be9c29b29330',
  dmitry: '1500648767791-00dcc994a43e',
  elena: '1534528741775-53994a69daeb',
  igor: '1472099645785-5658abf4ff4e',
  default: '1507003211169-0a1dd7228f2d',
} as const

/** Дефолтное фото для нового тура/поездки/поста */
export function defaultTourImage(): string {
  return unsplash(photos.defaultTour, { w: 800, h: 500 })
}

export function defaultTripImage(): string {
  return unsplash(photos.defaultTrip, { w: 800, h: 500 })
}

export function defaultAvatar(): string {
  return unsplashAvatar(avatars.default)
}
