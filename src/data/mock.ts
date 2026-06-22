import type { User, Post, Tour, Trip } from '@/types'
import { unsplash, unsplashAvatar, photos, avatars } from '@/utils/unsplash'

export const currentUser: User = {
  id: '1',
  nickname: 'travel_alex',
  firstName: 'Александр',
  lastName: 'Иванов',
  patronymic: 'Петрович',
  birthDate: '1995-03-15',
  avatar: unsplashAvatar(avatars.alex),
  about: 'Люблю горы, море и авторские маршруты. Делюсь впечатлениями и организую туры по России.',
  showTours: true,
  following: 128,
  followers: 342,
}

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    text: 'Невероятный закат на Байкале! Обязательно вернусь сюда зимой.',
    image: unsplash(photos.baikal, { w: 800, h: 500 }),
    views: 1240,
    likes: 89,
    createdAt: '2025-06-10T18:30:00',
  },
  {
    id: '2',
    userId: '1',
    text: 'Только что вернулся из Камчатки. Вулканы, гейзеры и дикая природа — must see!',
    image: unsplash(photos.kamchatka, { w: 800, h: 500 }),
    views: 856,
    likes: 67,
    createdAt: '2025-05-28T12:00:00',
  },
  {
    id: '3',
    userId: '1',
    text: 'Собираю группу на Алтай в июле. Кто со мной?',
    views: 432,
    likes: 34,
    createdAt: '2025-05-15T09:15:00',
  },
]

export const mockTours: Tour[] = [
  {
    id: '1',
    creatorId: '1',
    creatorName: 'Александр И.',
    creatorAvatar: unsplashAvatar(avatars.alex, 80),
    location: 'Байкал, Иркутская область',
    locationType: 'nature',
    shortDescription: 'Недельный тур по берегам Байкала с треккингом и баней',
    fullPlan: 'День 1: Прибытие в Иркутск, трансфер на Ольхон.\nДень 2-3: Треккинг к мысу Хобой.\nДень 4: Экскурсия на остров Огой.\nДень 5-6: Свободное время, баня.\nДень 7: Возвращение.',
    maxParticipants: 12,
    freeSpots: 4,
    price: 45000,
    startDate: '2025-07-15T08:00:00',
    endDate: '2025-07-22T18:00:00',
    images: [
      unsplash(photos.baikal, { w: 800, h: 500 }),
      unsplash(photos.baikal2, { w: 800, h: 500 }),
    ],
    isClosed: false,
  },
  {
    id: '2',
    creatorId: '2',
    creatorName: 'Мария К.',
    creatorAvatar: unsplashAvatar(avatars.maria, 80),
    location: 'Казань',
    locationType: 'city',
    shortDescription: 'Гастрономический тур по татарской столице',
    fullPlan: 'День 1: Обзорная экскурсия, Кремль.\nДень 2: Гастрономический маршрут, мастер-кlass.\nДень 3: Свободное время, шопинг.',
    maxParticipants: 8,
    freeSpots: 2,
    price: 18000,
    startDate: '2025-08-01T10:00:00',
    endDate: '2025-08-03T20:00:00',
    images: [unsplash(photos.kazan, { w: 800, h: 500 })],
    isClosed: false,
  },
  {
    id: '3',
    creatorId: '3',
    creatorName: 'Дмитрий С.',
    creatorAvatar: unsplashAvatar(avatars.dmitry, 80),
    location: 'Архстояние, Никола-Ленивец',
    locationType: 'festival',
    shortDescription: 'Поездка на фестиваль land-art в Калужской области',
    fullPlan: 'День 1: Выезд из Москвы, заселение.\nДень 2-3: Фестиваль, экскурсии по арт-объектам.\nДень 4: Возвращение.',
    maxParticipants: 15,
    freeSpots: 7,
    price: 12000,
    startDate: '2025-07-25T07:00:00',
    endDate: '2025-07-28T22:00:00',
    images: [unsplash(photos.festival, { w: 800, h: 500 })],
    isClosed: true,
  },
]

export const mockTrips: Trip[] = [
  {
    id: '1',
    creatorId: '1',
    creatorName: 'Александр И.',
    creatorAvatar: unsplashAvatar(avatars.alex, 80),
    location: 'Сочи, Краснодарский край',
    locationType: 'city',
    shortDescription: 'Выходные на море — пляж, горы и канатка',
    fullPlan: 'Сб: Прибытие, прогулка по набережной.\nВс: Подъём на Розу Хутор, возвращение.',
    maxParticipants: 6,
    freeSpots: 3,
    price: 8000,
    startDate: '2025-06-28T06:00:00',
    endDate: '2025-06-29T22:00:00',
    transport: 'Поезд',
    images: [unsplash(photos.sochi, { w: 800, h: 500 })],
    isClosed: false,
  },
  {
    id: '2',
    creatorId: '4',
    creatorName: 'Елена В.',
    creatorAvatar: unsplashAvatar(avatars.elena, 80),
    location: 'Карелия, Рускеала',
    locationType: 'nature',
    shortDescription: 'Однодневная поездка к мраморному каньону',
    fullPlan: '06:00 — Выезд из СПб.\n12:00 — Экскурсия по каньону.\n18:00 — Возвращение.',
    maxParticipants: 4,
    freeSpots: 1,
    price: 3500,
    startDate: '2025-07-05T06:00:00',
    endDate: '2025-07-05T21:00:00',
    transport: 'Автомобиль',
    images: [unsplash(photos.karelia, { w: 800, h: 500 })],
    isClosed: false,
  },
  {
    id: '3',
    creatorId: '5',
    creatorName: 'Игорь М.',
    creatorAvatar: unsplashAvatar(avatars.igor, 80),
    location: 'Нижний Новгород',
    locationType: 'city',
    shortDescription: 'Гастро-поездка на выходные',
    fullPlan: 'Сб: Экскурсия, ужин на Волге.\nВс: Ярмарка, возвращение.',
    maxParticipants: 8,
    freeSpots: 5,
    price: 6000,
    startDate: '2025-07-12T08:00:00',
    endDate: '2025-07-13T20:00:00',
    transport: 'Поезд',
    images: [unsplash(photos.nnovgorod, { w: 800, h: 500 })],
    isClosed: false,
  },
]

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
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(price)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
