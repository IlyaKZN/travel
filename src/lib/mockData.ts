export interface Trip {
  id: number
  from: string
  fromShort: string
  to: string
  toShort: string
  date: string
  time: string
  transport: string
  seats: number
  takenSeats: number
  host: { name: string; avatar: string; rating: number; trips: number }
  participants: { name: string; avatar: string }[]
  description: string
  tags: string[]
  image: string
}

export interface Message {
  id: number
  sender: string
  avatar: string
  text: string
  time: string
  isMe: boolean
}

export const TRIPS: Trip[] = [
  {
    id: 1,
    from: 'Москва',
    fromShort: 'МСК',
    to: 'Сочи',
    toShort: 'СОЧ',
    date: 'Сб, 5 июл',
    time: '09:00',
    transport: 'car',
    seats: 4,
    takenSeats: 2,
    host: {
      name: 'Мария К.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
      rating: 4.9,
      trips: 23,
    },
    participants: [
      { name: 'Иван', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
      { name: 'Анна', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
    ],
    description:
      'Поездка на выходные в Сочи! Комфортный кроссовер, отличная музыка и хорошая компания. Пунктуальность и позитив обязательны.',
    tags: ['Море', 'Выходные', 'Музыка'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    from: 'Санкт-Петербург',
    fromShort: 'СПБ',
    to: 'Карелия',
    toShort: 'КРЛ',
    date: 'Вс, 6 июл',
    time: '10:30',
    transport: 'train',
    seats: 6,
    takenSeats: 4,
    host: {
      name: 'Дмитрий С.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
      rating: 4.7,
      trips: 15,
    },
    participants: [
      { name: 'Ольга', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' },
      { name: 'Пётр', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&h=80&fit=crop' },
      { name: 'Елена', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop' },
    ],
    description:
      'Поездка к мраморному каньону! Поезд, настолки и отличная компания. Целый день впечатлений — ждём смех и хорошую музыку.',
    tags: ['Природа', 'Поезд', 'Однодневка'],
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    from: 'Казань',
    fromShort: 'КЗН',
    to: 'Нижний Новгород',
    toShort: 'НН',
    date: 'Пт, 11 июл',
    time: '07:00',
    transport: 'car',
    seats: 3,
    takenSeats: 1,
    host: {
      name: 'Елена В.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
      rating: 5.0,
      trips: 41,
    },
    participants: [
      { name: 'Артём', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop' },
    ],
    description:
      'Гастро-поездка на выходные! Ужин на Волге, ярмарка и отличные виды. Комфортная машина для длинной трассы.',
    tags: ['Гастро', 'Выходные', 'Город'],
    image: 'https://images.unsplash.com/photo-1480714378408-67c0d84e6e03?w=800&h=400&fit=crop',
  },
  {
    id: 4,
    from: 'Москва',
    fromShort: 'МСК',
    to: 'Тула',
    toShort: 'ТУЛ',
    date: 'Сб, 12 июл',
    time: '08:30',
    transport: 'car',
    seats: 3,
    takenSeats: 0,
    host: {
      name: 'Игорь М.',
      avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&h=80&fit=crop',
      rating: 4.8,
      trips: 9,
    },
    participants: [],
    description:
      'Живописная поездка в Тулу. Планируем остановку у кафе с пирожками. Кофе и хороший разговор обязательны.',
    tags: ['Город', 'Гастро', 'Кофе'],
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop',
  },
  {
    id: 5,
    from: 'Краснодар',
    fromShort: 'КРД',
    to: 'Анапа',
    toShort: 'АНП',
    date: 'Вс, 13 июл',
    time: '06:00',
    transport: 'bus',
    seats: 8,
    takenSeats: 5,
    host: {
      name: 'София Р.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
      rating: 4.6,
      trips: 7,
    },
    participants: [
      { name: 'Кирилл', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
      { name: 'Сара', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
    ],
    description:
      'Групповая поездка в Анапу на пляжный день. Чем больше народу — тем веселее! Отличная энергия гарантирована.',
    tags: ['Пляж', 'Группа', 'Отдых'],
    image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=400&fit=crop',
  },
  {
    id: 6,
    from: 'Екатеринбург',
    fromShort: 'ЕКБ',
    to: 'Алтай',
    toShort: 'АЛТ',
    date: 'Пт, 18 июл',
    time: '07:30',
    transport: 'car',
    seats: 4,
    takenSeats: 1,
    host: {
      name: 'Кай Б.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop',
      rating: 4.9,
      trips: 31,
    },
    participants: [
      { name: 'Нора', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop' },
    ],
    description:
      'Горная поездка на Алтай. Потрясающие виды — берите тёплую одежду и удобную обувь для прогулок!',
    tags: ['Горы', 'Природа', 'Приключение'],
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
  },
]

export const MESSAGES: Message[] = [
  {
    id: 1,
    sender: 'Мария К.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    text: 'Привет всем! 🙌 Очень жду поездку в Сочи!',
    time: '09:32',
    isMe: false,
  },
  {
    id: 2,
    sender: 'Иван Р.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    text: 'А где встречаемся? У вокзала или Мария забирает по пути?',
    time: '09:34',
    isMe: false,
  },
  {
    id: 3,
    sender: 'Я',
    avatar: '',
    text: 'Мне удобно и так, и так! У вокзала тоже ок 👌',
    time: '09:35',
    isMe: true,
  },
  {
    id: 4,
    sender: 'Мария К.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    text: 'Отлично! Встречаемся у главного входа в 9:00. Возьму перекус 🍊',
    time: '09:37',
    isMe: false,
  },
  {
    id: 5,
    sender: 'Анна Л.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
    text: 'Ура! Возьму портативную колонку, если всем ок?',
    time: '09:40',
    isMe: false,
  },
  {
    id: 6,
    sender: 'Я',
    avatar: '',
    text: '100% да колонке! Плейлист для дороги уже грузится... 🎵',
    time: '09:41',
    isMe: true,
  },
  {
    id: 7,
    sender: 'Иван Р.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    text: 'Кстати, кому-то нужна вода? Могу взять пару бутылок.',
    time: '09:43',
    isMe: false,
  },
]
