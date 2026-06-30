import { z } from 'zod'

const IMAGE_MAX_BYTES = 5 * 1024 * 1024
const DATA_URL_RE = /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/]+={0,2}$/
const HTTP_URL_RE = /^https?:\/\/.+/i

export const messageImageSchema = z
  .string()
  .refine((value) => {
    if (!value) return true
    if (HTTP_URL_RE.test(value)) return true
    if (!DATA_URL_RE.test(value)) return false
    const [, payload = ''] = value.split(',', 2)
    return Math.ceil((payload.length * 3) / 4) <= IMAGE_MAX_BYTES
  }, 'Изображение должно быть PNG, JPG или WebP до 5 МБ, либо ссылкой http(s)')

export function messagePreview(text: string, image?: string | null) {
  const trimmed = text.trim()
  if (trimmed) return trimmed.slice(0, 120)
  if (image) return 'Фото'
  return ''
}
