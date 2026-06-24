export function transportLabel(type: string): string {
  return (
    {
      car: 'Авто',
      train: 'Поезд',
      bus: 'Автобус',
      plane: 'Самолёт',
    }[type] ?? 'Авто'
  )
}

export function seatsLeftLabel(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} место`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} места`
  return `${count} мест`
}

export const TRANSPORT_FILTERS = [
  { id: 'all', label: 'Все' },
  { id: 'car', label: 'Авто' },
  { id: 'train', label: 'Поезд' },
  { id: 'bus', label: 'Автобус' },
  { id: 'flight', label: 'Самолёт' },
] as const

export const TRANSPORT_FORM_OPTIONS = [
  { type: 'car' as const, label: 'Авто' },
  { type: 'train' as const, label: 'Поезд' },
  { type: 'bus' as const, label: 'Автобус' },
  { type: 'plane' as const, label: 'Самолёт' },
]

export const DESKTOP_TRANSPORT_FILTERS = [
  { type: 'car', label: 'Авто' },
  { type: 'train', label: 'Поезд' },
  { type: 'bus', label: 'Автобус' },
  { type: 'plane', label: 'Самолёт' },
] as const

export function formatTime(date = new Date()): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function openSeatsLabel(min: number): string {
  if (min === 1) return 'минимум 1 свободное место'
  return `минимум ${min} свободных мест`
}
