export const locationTypeLabels: Record<string, string> = {
  city: 'Город',
  festival: 'Фестиваль',
  nature: 'Природа',
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  const timePart = date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${datePart} ${timePart}`
}

export function formatSpots(free: number, max: number): string {
  if (free <= 0) return 'Мест нет'
  if (free === max) return `Свободно ${free} ${spotsWord(free)}`
  return `Свободно ${free} из ${max}`
}

function spotsWord(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'место'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'места'
  return 'мест'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}
