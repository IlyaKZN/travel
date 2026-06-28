import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import { prisma } from '../lib/prisma.js'
import { unsplash, unsplashAvatar } from '../utils/helpers.js'
import { createTripConversation } from './chat.service.js'

const DEMO_PASSWORD = 'demo1234'

export async function seedDatabase() {
  const userCount = await prisma.user.count()
  if (userCount > 0) return

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)
  const now = new Date()

  await prisma.user.createMany({
    data: [
      {
        id: '1',
        contact: 'alex@travels.ru',
        passwordHash,
        nickname: 'travel_alex',
        firstName: 'Александр',
        lastName: 'Иванов',
        patronymic: 'Петрович',
        birthDate: '1995-03-15',
        avatar: unsplashAvatar('1507003211169-0a1dd7228f2d'),
        about:
          'Люблю горы, море и авторские маршруты. Делюсь впечатлениями и организую туры по России.',
        showTours: true,
        following: 128,
        followers: 342,
        profileComplete: true,
        createdAt: now,
      },
      {
        id: '2',
        contact: 'maria@travels.ru',
        passwordHash,
        nickname: 'maria_k',
        firstName: 'Мария',
        lastName: 'Козлова',
        birthDate: '1992-08-20',
        avatar: unsplashAvatar('1494790108377-be9c29b29330'),
        about: 'Гастрономические туры и городские маршруты.',
        showTours: true,
        following: 89,
        followers: 210,
        profileComplete: true,
        createdAt: now,
      },
      {
        id: '3',
        contact: 'dmitry@travels.ru',
        passwordHash,
        nickname: 'dmitry_s',
        firstName: 'Дмитрий',
        lastName: 'Смирнов',
        birthDate: '1988-11-03',
        avatar: unsplashAvatar('1500648767791-00dcc994a43e'),
        showTours: true,
        following: 45,
        followers: 156,
        profileComplete: true,
        createdAt: now,
      },
      {
        id: '4',
        contact: 'elena@travels.ru',
        passwordHash,
        nickname: 'elena_v',
        firstName: 'Елена',
        lastName: 'Волкова',
        birthDate: '1997-04-12',
        avatar: unsplashAvatar('1534528741775-53994a69daeb'),
        showTours: true,
        following: 67,
        followers: 98,
        profileComplete: true,
        createdAt: now,
      },
      {
        id: '5',
        contact: 'igor@travels.ru',
        passwordHash,
        nickname: 'igor_m',
        firstName: 'Игорь',
        lastName: 'Морозов',
        birthDate: '1990-01-28',
        avatar: unsplashAvatar('1472099645785-5658abf4ff4e'),
        showTours: true,
        following: 34,
        followers: 78,
        profileComplete: true,
        createdAt: now,
      },
    ],
  })

  await prisma.post.createMany({
    data: [
      {
        id: uuid(),
        userId: '1',
        text: 'Невероятный закат на Байкале! Обязательно вернусь сюда зимой.',
        image: unsplash('1551888775-22fb19f1082f'),
        views: 1240,
        likes: 89,
        createdAt: new Date('2025-06-10T18:30:00.000Z'),
      },
      {
        id: uuid(),
        userId: '1',
        text: 'Только что вернулся из Камчатки. Вулканы, гейзеры и дикая природа — must see!',
        image: unsplash('1501785888041-ca3a779714ca'),
        views: 856,
        likes: 67,
        createdAt: new Date('2025-05-28T12:00:00.000Z'),
      },
      {
        id: uuid(),
        userId: '1',
        text: 'Собираю группу на Алтай в июле. Кто со мной?',
        views: 432,
        likes: 34,
        createdAt: new Date('2025-05-15T09:15:00.000Z'),
      },
    ],
  })

  await prisma.tour.createMany({
    data: [
      {
        id: '1',
        creatorId: '1',
        location: 'Байкал, Иркутская область',
        locationType: 'nature',
        shortDescription: 'Недельный тур по берегам Байкала с треккингом и баней',
        fullPlan:
          'День 1: Прибытие в Иркутск, трансфер на Ольхон.\nДень 2-3: Треккинг к мысу Хобой.\nДень 4: Экскурсия на остров Огой.\nДень 5-6: Свободное время, баня.\nДень 7: Возвращение.',
        maxParticipants: 12,
        freeSpots: 4,
        price: 45000,
        startDate: new Date('2025-07-15T08:00:00.000Z'),
        endDate: new Date('2025-07-22T18:00:00.000Z'),
        images: [unsplash('1551888775-22fb19f1082f'), unsplash('1506905925346-21bda4d32df4')],
        isClosed: false,
        isDraft: false,
        createdAt: now,
      },
      {
        id: '2',
        creatorId: '2',
        location: 'Казань',
        locationType: 'city',
        shortDescription: 'Гастрономический тур по татарской столице',
        fullPlan:
          'День 1: Обзорная экскурсия, Кремль.\nДень 2: Гастрономический маршрут, мастер-класс.\nДень 3: Свободное время, шопинг.',
        maxParticipants: 8,
        freeSpots: 2,
        price: 18000,
        startDate: new Date('2025-08-01T10:00:00.000Z'),
        endDate: new Date('2025-08-03T20:00:00.000Z'),
        images: [unsplash('1514565837817-1a7db783a4d0')],
        isClosed: false,
        isDraft: false,
        createdAt: now,
      },
      {
        id: '3',
        creatorId: '3',
        location: 'Архстояние, Никола-Ленивец',
        locationType: 'festival',
        shortDescription: 'Поездка на фестиваль land-art в Калужской области',
        fullPlan:
          'День 1: Выезд из Москвы, заселение.\nДень 2-3: Фестиваль, экскурсии по арт-объектам.\nДень 4: Возвращение.',
        maxParticipants: 15,
        freeSpots: 7,
        price: 12000,
        startDate: new Date('2025-07-25T07:00:00.000Z'),
        endDate: new Date('2025-07-28T22:00:00.000Z'),
        images: [unsplash('1533170492542-3d8f1e77401b')],
        isClosed: true,
        isDraft: false,
        createdAt: now,
      },
    ],
  })

  await prisma.trip.createMany({
    data: [
      {
        id: '1',
        creatorId: '1',
        location: 'Сочи, Краснодарский край',
        locationType: 'city',
        shortDescription: 'Выходные на море — пляж, горы и канатка',
        fullPlan: 'Сб: Прибытие, прогулка по набережной.\nВс: Подъём на Розу Хутор, возвращение.',
        maxParticipants: 6,
        freeSpots: 3,
        price: 8000,
        startDate: new Date('2025-06-28T06:00:00.000Z'),
        endDate: new Date('2025-06-29T22:00:00.000Z'),
        transport: 'Поезд',
        images: [unsplash('1507525428034-b723cf961d3e')],
        isClosed: false,
        isDraft: false,
        createdAt: now,
      },
      {
        id: '2',
        creatorId: '4',
        location: 'Карелия, Рускеала',
        locationType: 'nature',
        shortDescription: 'Однодневная поездка к мраморному каньону',
        fullPlan: '06:00 — Выезд из СПб.\n12:00 — Экскурсия по каньону.\n18:00 — Возвращение.',
        maxParticipants: 4,
        freeSpots: 1,
        price: 3500,
        startDate: new Date('2025-07-05T06:00:00.000Z'),
        endDate: new Date('2025-07-05T21:00:00.000Z'),
        transport: 'Автомобиль',
        images: [unsplash('1441974231531-c6227db76b6e')],
        isClosed: false,
        isDraft: false,
        createdAt: now,
      },
      {
        id: '3',
        creatorId: '5',
        location: 'Нижний Новгород',
        locationType: 'city',
        shortDescription: 'Гастро-поездка на выходные',
        fullPlan: 'Сб: Экскурсия, ужин на Волге.\nВс: Ярмарка, возвращение.',
        maxParticipants: 8,
        freeSpots: 5,
        price: 6000,
        startDate: new Date('2025-07-12T08:00:00.000Z'),
        endDate: new Date('2025-07-13T20:00:00.000Z'),
        transport: 'Поезд',
        images: [unsplash('1480714378408-67c0d84e6e03')],
        isClosed: false,
        isDraft: false,
        createdAt: now,
      },
    ],
  })

  await prisma.tripSignup.create({
    data: { tripId: '1', userId: '4' },
  })

  await prisma.conversation.create({
    data: {
      id: 'conv-dm-1',
      type: 'dm',
      createdAt: new Date('2025-06-01T10:00:00.000Z'),
      lastMessageAt: new Date('2025-06-18T14:30:00.000Z'),
      lastMessageText: 'Привет! Когда следующий тур в Казань?',
      participants: {
        create: [
          { userId: '1', lastReadAt: new Date('2025-06-18T14:20:00.000Z') },
          { userId: '2', lastReadAt: new Date('2025-06-18T14:31:00.000Z') },
        ],
      },
    },
  })

  await prisma.conversation.create({
    data: {
      id: 'conv-trip-1',
      type: 'trip',
      tripId: '1',
      createdAt: new Date('2025-06-15T08:00:00.000Z'),
      lastMessageAt: new Date('2025-06-20T09:15:00.000Z'),
      lastMessageText: 'Встречаемся у вокзала в 6:00',
      participants: {
        create: [
          { userId: '1', lastReadAt: new Date('2025-06-20T09:16:00.000Z') },
          { userId: '4', lastReadAt: new Date('2025-06-19T15:45:00.000Z') },
        ],
      },
    },
  })

  await prisma.message.createMany({
    data: [
      {
        id: uuid(),
        conversationId: 'conv-dm-1',
        senderId: '2',
        text: 'Привет, Александр! Видела твои посты про Байкал — круто!',
        createdAt: new Date('2025-06-18T14:00:00.000Z'),
      },
      {
        id: uuid(),
        conversationId: 'conv-dm-1',
        senderId: '1',
        text: 'Спасибо! А у тебя тур в Казань ещё актуален?',
        createdAt: new Date('2025-06-18T14:15:00.000Z'),
      },
      {
        id: uuid(),
        conversationId: 'conv-dm-1',
        senderId: '2',
        text: 'Привет! Когда следующий тур в Казань?',
        createdAt: new Date('2025-06-18T14:30:00.000Z'),
      },
      {
        id: uuid(),
        conversationId: 'conv-trip-1',
        senderId: '1',
        text: 'Всем привет! Это общий чат поездки в Сочи.',
        createdAt: new Date('2025-06-19T12:00:00.000Z'),
      },
      {
        id: uuid(),
        conversationId: 'conv-trip-1',
        senderId: '4',
        text: 'Привет! Подскажите, что взять с собой?',
        createdAt: new Date('2025-06-19T15:30:00.000Z'),
      },
      {
        id: uuid(),
        conversationId: 'conv-trip-1',
        senderId: '1',
        text: 'Встречаемся у вокзала в 6:00',
        createdAt: new Date('2025-06-20T09:15:00.000Z'),
      },
    ],
  })

  const trips = await prisma.trip.findMany({ select: { id: true } })
  for (const trip of trips) {
    const existing = await prisma.conversation.findUnique({ where: { tripId: trip.id } })
    if (!existing) {
      await createTripConversation(trip.id)
    }
  }

  await prisma.review.createMany({
    data: [
      {
        id: uuid(),
        userId: '1',
        authorId: '2',
        text: 'Отличный организатор! Поездка в Сочи прошла без суеты, всё было продумано.',
        createdAt: new Date('2025-06-21T10:00:00.000Z'),
      },
      {
        id: uuid(),
        userId: '1',
        authorId: '4',
        text: 'Александр помог с маршрутом и всегда был на связи. Рекомендую как попутчика.',
        createdAt: new Date('2025-06-22T14:30:00.000Z'),
      },
      {
        id: uuid(),
        userId: '2',
        authorId: '1',
        text: 'Мария классно ведёт гастрономические туры — много интересных мест и вкусной еды.',
        createdAt: new Date('2025-06-20T18:00:00.000Z'),
      },
    ],
  })

  console.log(`[seed] Demo users password: ${DEMO_PASSWORD}`)
  console.log('[seed] Demo login: alex@travels.ru')
}
