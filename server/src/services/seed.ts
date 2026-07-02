import { prisma } from '../lib/prisma.js'
import { addUserToTripChat, createTripConversation } from './chat.service.js'
import { hashPassword, unsplash } from '../utils/helpers.js'
import type { LocationType } from '@prisma/client'

const seedAccounts = [
  {
    id: 'seed-user-001',
    contact: 'dumkin215@yandex.ru',
    password: '123456',
    nickname: 'danvolkov',
    firstName: 'Даниил',
    lastName: 'Волков',
    location: 'Москва',
    birthDate: '1995-03-14',
    about: 'Люблю короткие поездки на выходные, горы и разговоры у костра',
    avatar: 'https://p7.tabor.ru/photos/2026-03-19/64086635/196358507_800x600.jpg',
    following: 18,
    followers: 42,
  },
  {
    id: 'seed-user-002',
    contact: 'pich214@yandex.ru',
    password: '666666',
    nickname: 'pavelsky',
    firstName: 'Павел',
    lastName: 'Смирнов',
    location: 'Санкт-Петербург',
    birthDate: '1992-11-02',
    about: 'Планирую маршруты, где есть поезд, кофе на вокзале и красивые виды',
    avatar: 'https://thumbs.dreamstime.com/b/молодой-красивый-мужчина-со-светлыми-волосами-ослабляя-в-парке-207586050.jpg',
    following: 27,
    followers: 64,
  },
  {
    id: 'seed-user-003',
    contact: 'ilia.pichugin2014@yandex.ru',
    password: 'qwerty123',
    nickname: 'artemroad',
    firstName: 'Артём',
    lastName: 'Лебедев',
    location: 'Казань',
    birthDate: '1998-07-21',
    about: 'Собираю компанию для автопутешествий и городских вылазок',
    avatar: 'https://i.pinimg.com/originals/aa/33/74/aa3374405c8d93a5a0d314aa7fd08b45.jpg?nii=t',
    following: 12,
    followers: 35,
  },
  {
    id: 'seed-user-004',
    contact: 'test@yandex.ru',
    password: 'qwerty123',
    nickname: 'tester',
    firstName: 'Аня',
    lastName: 'Соколова',
    location: 'Екатеринбург',
    birthDate: '1997-01-09',
    about: 'Тестирую новые маршруты и всегда беру с собой плёночный фотоаппарат',
    avatar: 'https://i.pinimg.com/736x/a3/17/0e/a3170efd817d6caef3c1ce49b06e0357.jpg',
    following: 31,
    followers: 58,
  },
  {
    id: 'seed-user-005',
    contact: 'maria.demo@yandex.ru',
    password: 'qwerty123',
    nickname: 'mariaway',
    firstName: 'Мария',
    lastName: 'Орлова',
    location: 'Нижний Новгород',
    birthDate: '1994-05-26',
    about: 'Ищу спокойные маршруты, старые города, музеи и локальные кафе',
    avatar: 'https://i.pinimg.com/736x/f2/a0/b1/f2a0b130104a0b3bbed4c1f78ab81a36.jpg',
    following: 22,
    followers: 49,
  },
  {
    id: 'seed-user-006',
    contact: 'nikita.demo@yandex.ru',
    password: 'qwerty123',
    nickname: 'nikitahike',
    firstName: 'Никита',
    lastName: 'Кириллов',
    location: 'Новосибирск',
    birthDate: '1991-09-18',
    about: 'Хожу в походы, знаю базовую медицину и умею чинить горелки',
    avatar: 'https://i.pinimg.com/originals/aa/33/74/aa3374405c8d93a5a0d314aa7fd08b45.jpg?nii=t',
    following: 40,
    followers: 83,
  },
  {
    id: 'seed-user-007',
    contact: 'lena.demo@yandex.ru',
    password: 'qwerty123',
    nickname: 'lenatravel',
    firstName: 'Лена',
    lastName: 'Морозова',
    location: 'Самара',
    birthDate: '1996-12-04',
    about: 'Люблю фестивали, палатки и маршруты без лишней спешки',
    avatar: 'https://i.pinimg.com/originals/ac/d8/c8/acd8c880b794d900f6715c404bf6d8c9.jpg',
    following: 16,
    followers: 37,
  },
]

const trips = [
  {
    id: 'seed-trip-001',
    creatorContact: 'dumkin215@yandex.ru',
    location: 'Москва → Карелия',
    locationType: 'nature' as LocationType,
    shortDescription: 'Едем на машине к ладожским шхерам, ночуем в домиках и гуляем по экотропам',
    fullPlan:
      'Выезд из Москвы рано утром. По дороге останавливаемся в Твери и Петрозаводске, два дня гуляем у воды, один день оставляем под Рускеалу. Нужны тёплые вещи и готовность помогать с общими продуктами',
    maxParticipants: 5,
    price: 18000,
    transport: 'car',
    tags: ['Природа', 'Хайкинг', 'Фото', 'Комфорт'],
    images: [unsplash('1500530855697-b586d89ba3ee'), unsplash('1500534314209-a25ddb2bd429')],
    startInDays: 18,
    durationDays: 5,
    participants: ['test@yandex.ru', 'nikita.demo@yandex.ru'],
    pending: ['maria.demo@yandex.ru'],
    messages: [
      { senderContact: 'dumkin215@yandex.ru', text: 'Привет! Я добавил предварительный план и список вещей' },
      { senderContact: 'nikita.demo@yandex.ru', text: 'Возьму аптечку и запасной фонарь' },
      { senderContact: 'test@yandex.ru', text: 'Я могу заняться завтраками на первые два дня' },
    ],
  },
  {
    id: 'seed-trip-002',
    creatorContact: 'pich214@yandex.ru',
    location: 'Санкт-Петербург → Архангельск',
    locationType: 'city' as LocationType,
    shortDescription: 'Поездом на север: деревянная архитектура, набережная и короткая вылазка к Белому морю',
    fullPlan:
      'Покупаем билеты на ночной поезд, заселяемся рядом с центром, один день гуляем по Архангельску, второй день едем к морю. Темп спокойный, бюджет без перелётов',
    maxParticipants: 4,
    price: 14500,
    transport: 'train',
    tags: ['Городской уикенд', 'Фото', 'Комфорт'],
    images: [unsplash('1500534314209-a25ddb2bd429'), unsplash('1519681393784-d120267933ba')],
    startInDays: 32,
    durationDays: 4,
    participants: ['maria.demo@yandex.ru'],
    pending: ['lena.demo@yandex.ru'],
    messages: [
      { senderContact: 'pich214@yandex.ru', text: 'Билеты пока есть в одном вагоне, лучше определиться на неделе' },
      { senderContact: 'maria.demo@yandex.ru', text: 'Мне подходит спокойный темп, могу поискать жильё' },
    ],
  },
  {
    id: 'seed-trip-003',
    creatorContact: 'ilia.pichugin2014@yandex.ru',
    location: 'Казань → Нижний Новгород',
    locationType: 'city' as LocationType,
    shortDescription: 'Автопоездка на длинные выходные: кремль, набережные и локальная еда',
    fullPlan:
      'Стартуем утром из Казани, приезжаем к вечеру. В планах прогулки по центру, канатная дорога, закаты на набережной и несколько проверенных мест с едой',
    maxParticipants: 4,
    price: 9000,
    transport: 'car',
    tags: ['Городской уикенд', 'Гастротур'],
    images: [unsplash('1476514529935-07be3d397c4b'), unsplash('1528127269322-539801943592')],
    startInDays: 11,
    durationDays: 3,
    participants: ['dumkin215@yandex.ru'],
    pending: [],
    messages: [
      { senderContact: 'ilia.pichugin2014@yandex.ru', text: 'В машине осталось два места, выезд планирую в 8 утра' },
      { senderContact: 'dumkin215@yandex.ru', text: 'Ок, могу сесть за руль на обратной дороге' },
    ],
  },
  {
    id: 'seed-trip-004',
    creatorContact: 'lena.demo@yandex.ru',
    location: 'Самара → Архстояние',
    locationType: 'festival' as LocationType,
    shortDescription: 'Фестивальный уикенд с палатками, арт-объектами и неспешными прогулками',
    fullPlan:
      'Едем автобусом до Калуги, дальше трансфером. Берём палатки, спальники и дождевики. План свободный: лекции, музыка, прогулки и общий ужин вечером',
    maxParticipants: 6,
    price: 12500,
    transport: 'bus',
    tags: ['Фестиваль', 'Природа', 'Йога', 'Хайкинг'],
    images: [unsplash('1464822759023-fed622ff2c3b'), unsplash('1500530855697-b586d89ba3ee')],
    startInDays: 46,
    durationDays: 4,
    participants: ['test@yandex.ru', 'maria.demo@yandex.ru'],
    pending: ['nikita.demo@yandex.ru'],
    messages: [
      { senderContact: 'lena.demo@yandex.ru', text: 'Я составила общий список снаряжения, палаток пока хватает на всех' },
      { senderContact: 'maria.demo@yandex.ru', text: 'Могу взять горелку и кастрюлю' },
      {
        senderContact: 'maria.demo@yandex.ru',
        text: 'Кидаю пару фоток с прошлого раза — там просто космос ✨',
        image: unsplash('1464822759023-fed622ff2c3b', 1200, 800),
      },
      {
        senderContact: 'maria.demo@yandex.ru',
        text: '',
        image: unsplash('1519681393784-d120267933ba', 1200, 800),
      },
      { senderContact: 'test@yandex.ru', text: 'Огонь, теперь ещё больше хочется!' },
      {
        senderContact: 'lena.demo@yandex.ru',
        text: 'А вот вид с канатки 🚡',
        image: unsplash('1483728642387-6c3bdd6c93e5', 1200, 800),
      },
    ],
  },
]

const tours = [
  {
    id: 'seed-tour-001',
    creatorContact: 'maria.demo@yandex.ru',
    location: 'Суздаль',
    locationType: 'city' as LocationType,
    shortDescription: 'Камерный тур по Суздалю с ремесленными мастерскими и прогулкой вдоль Каменки',
    fullPlan:
      'Встречаемся утром у автовокзала, гуляем по центру, заходим в мастерскую керамики, обедаем в локальном кафе и заканчиваем день на смотровой площадке',
    maxParticipants: 8,
    freeSpots: 5,
    price: 4200,
    images: [unsplash('1500530855697-b586d89ba3ee')],
    startInDays: 24,
    durationDays: 1,
    participants: ['test@yandex.ru', 'lena.demo@yandex.ru', 'pich214@yandex.ru'],
  },
  {
    id: 'seed-tour-002',
    creatorContact: 'nikita.demo@yandex.ru',
    location: 'Алтай',
    locationType: 'nature' as LocationType,
    shortDescription: 'Треккинг без спортивного героизма: базовые тропы, виды и вечерние костры',
    fullPlan:
      'Подойдёт новичкам с нормальной физической формой. Идём радиально от базы, обсуждаем безопасность, делим продукты и оставляем время на отдых',
    maxParticipants: 7,
    freeSpots: 4,
    price: 26000,
    images: [unsplash('1464822759023-fed622ff2c3b')],
    startInDays: 58,
    durationDays: 6,
    participants: ['dumkin215@yandex.ru', 'ilia.pichugin2014@yandex.ru', 'maria.demo@yandex.ru'],
  },
]

const reviews = [
  {
    id: 'seed-review-001',
    userContact: 'dumkin215@yandex.ru',
    authorContact: 'test@yandex.ru',
    text: 'Даниил отлично держит связь и заранее предупреждает обо всех изменениях. В поездке было спокойно и понятно',
    daysAgo: 6,
  },
  {
    id: 'seed-review-002',
    userContact: 'pich214@yandex.ru',
    authorContact: 'maria.demo@yandex.ru',
    text: 'Павел нашёл удобные билеты и классное жильё. Очень аккуратный организатор',
    daysAgo: 12,
  },
  {
    id: 'seed-review-003',
    userContact: 'maria.demo@yandex.ru',
    authorContact: 'lena.demo@yandex.ru',
    text: 'Мария умеет выбирать атмосферные места и не перегружает маршрут',
    daysAgo: 18,
  },
  {
    id: 'seed-review-004',
    userContact: 'nikita.demo@yandex.ru',
    authorContact: 'dumkin215@yandex.ru',
    text: 'С Никитой безопасно идти на природу: всё продумано, аптечка и снаряжение на месте',
    daysAgo: 25,
  },
  {
    id: 'seed-review-005',
    userContact: 'test@yandex.ru',
    authorContact: 'ilia.pichugin2014@yandex.ru',
    text: 'Аня быстро включается в общие задачи и делает поездку веселее',
    daysAgo: 3,
  },
]

const posts = [
  {
    id: 'seed-post-001',
    contact: 'test@yandex.ru',
    text: 'Вернулась из короткой поездки по Волге. Лучший формат для перезагрузки: один город, две прогулки и никакой гонки по достопримечательностям',
    image: unsplash('1476514529935-07be3d397c4b'),
    views: 128,
    likes: 24,
    daysAgo: 2,
  },
  {
    id: 'seed-post-002',
    contact: 'nikita.demo@yandex.ru',
    text: 'Перед походом проверяйте обувь на короткой прогулке. Новые ботинки в первый день маршрута - почти всегда плохая идея',
    image: unsplash('1464822759023-fed622ff2c3b'),
    views: 214,
    likes: 46,
    daysAgo: 5,
  },
  {
    id: 'seed-post-003',
    contact: 'maria.demo@yandex.ru',
    text: 'Собрала список маленьких городов для спокойных выходных: Суздаль, Торжок, Плёс, Тутаев. Кто что добавит?',
    image: unsplash('1500530855697-b586d89ba3ee'),
    views: 176,
    likes: 31,
    daysAgo: 9,
  },
]

function daysFromNow(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

export async function seedDatabase() {
  const usersByContact = new Map<string, string>()

  for (const account of seedAccounts) {
    const contact = account.contact.trim().toLowerCase()
    const passwordHash = await hashPassword(account.password)

    const user = await prisma.user.upsert({
      where: { contact },
      create: {
        id: account.id,
        contact,
        passwordHash,
        nickname: account.nickname,
        firstName: account.firstName,
        lastName: account.lastName,
        patronymic: account.location,
        birthDate: account.birthDate,
        avatar: account.avatar,
        about: account.about,
        following: account.following,
        followers: account.followers,
        profileComplete: true,
      },
      update: {
        passwordHash,
        nickname: account.nickname,
        firstName: account.firstName,
        lastName: account.lastName,
        patronymic: account.location,
        birthDate: account.birthDate,
        avatar: account.avatar,
        about: account.about,
        following: account.following,
        followers: account.followers,
        profileComplete: true,
      },
    })
    usersByContact.set(contact, user.id)
  }

  for (const post of posts) {
    const userId = usersByContact.get(post.contact)
    if (!userId) continue

    await prisma.post.upsert({
      where: { id: post.id },
      create: {
        id: post.id,
        userId,
        text: post.text,
        image: post.image,
        views: post.views,
        likes: post.likes,
        createdAt: daysAgo(post.daysAgo),
      },
      update: {
        userId,
        text: post.text,
        image: post.image,
        views: post.views,
        likes: post.likes,
        createdAt: daysAgo(post.daysAgo),
      },
    })
  }

  for (const tripSeed of trips) {
    const creatorId = usersByContact.get(tripSeed.creatorContact)
    if (!creatorId) continue

    const participantIds = tripSeed.participants.flatMap((contact) => {
      const userId = usersByContact.get(contact)
      return userId ? [userId] : []
    })
    const pendingUserIds = tripSeed.pending.flatMap((contact) => {
      const userId = usersByContact.get(contact)
      return userId ? [userId] : []
    })
    const startDate = daysFromNow(tripSeed.startInDays)
    const endDate = daysFromNow(tripSeed.startInDays + tripSeed.durationDays)

    await prisma.trip.upsert({
      where: { id: tripSeed.id },
      create: {
        id: tripSeed.id,
        creatorId,
        location: tripSeed.location,
        locationType: tripSeed.locationType,
        shortDescription: tripSeed.shortDescription,
        fullPlan: tripSeed.fullPlan,
        maxParticipants: tripSeed.maxParticipants,
        freeSpots: Math.max(0, tripSeed.maxParticipants - 1 - participantIds.length),
        price: tripSeed.price,
        startDate,
        endDate,
        transport: tripSeed.transport,
        tags: tripSeed.tags ?? [],
        images: tripSeed.images,
      },
      update: {
        creatorId,
        location: tripSeed.location,
        locationType: tripSeed.locationType,
        shortDescription: tripSeed.shortDescription,
        fullPlan: tripSeed.fullPlan,
        maxParticipants: tripSeed.maxParticipants,
        freeSpots: Math.max(0, tripSeed.maxParticipants - 1 - participantIds.length),
        price: tripSeed.price,
        startDate,
        endDate,
        transport: tripSeed.transport,
        tags: tripSeed.tags ?? [],
        images: tripSeed.images,
        isClosed: false,
        isDraft: false,
      },
    })

    await prisma.tripSignup.deleteMany({ where: { tripId: tripSeed.id } })
    await prisma.tripJoinRequest.deleteMany({ where: { tripId: tripSeed.id } })
    await prisma.tripSignup.createMany({
      data: participantIds.map((userId) => ({ tripId: tripSeed.id, userId })),
      skipDuplicates: true,
    })
    await prisma.tripJoinRequest.createMany({
      data: pendingUserIds.map((userId) => ({ tripId: tripSeed.id, userId })),
      skipDuplicates: true,
    })

    const conversation = await createTripConversation(tripSeed.id)
    for (const userId of [creatorId, ...participantIds]) {
      await addUserToTripChat(tripSeed.id, userId)
    }

    for (const [index, messageSeed] of tripSeed.messages.entries()) {
      const senderId = usersByContact.get(messageSeed.senderContact)
      if (!senderId) continue
      await prisma.message.upsert({
        where: { id: `${tripSeed.id}-message-${index + 1}` },
        create: {
          id: `${tripSeed.id}-message-${index + 1}`,
          conversationId: conversation.id,
          senderId,
          text: messageSeed.text,
          image: messageSeed.image ?? null,
          createdAt: daysAgo(tripSeed.messages.length - index),
        },
        update: {
          conversationId: conversation.id,
          senderId,
          text: messageSeed.text,
          image: messageSeed.image ?? null,
          createdAt: daysAgo(tripSeed.messages.length - index),
        },
      })
    }

    const lastMessage = tripSeed.messages.at(-1)
    if (lastMessage) {
      const preview = lastMessage.text.trim()
        ? lastMessage.text.slice(0, 120)
        : lastMessage.image
          ? 'Фото'
          : ''
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: daysAgo(1),
          lastMessageText: preview,
        },
      })
    }
  }

  for (const tourSeed of tours) {
    const creatorId = usersByContact.get(tourSeed.creatorContact)
    if (!creatorId) continue

    await prisma.tour.upsert({
      where: { id: tourSeed.id },
      create: {
        id: tourSeed.id,
        creatorId,
        location: tourSeed.location,
        locationType: tourSeed.locationType,
        shortDescription: tourSeed.shortDescription,
        fullPlan: tourSeed.fullPlan,
        maxParticipants: tourSeed.maxParticipants,
        freeSpots: tourSeed.freeSpots,
        price: tourSeed.price,
        startDate: daysFromNow(tourSeed.startInDays),
        endDate: daysFromNow(tourSeed.startInDays + tourSeed.durationDays),
        images: tourSeed.images,
      },
      update: {
        creatorId,
        location: tourSeed.location,
        locationType: tourSeed.locationType,
        shortDescription: tourSeed.shortDescription,
        fullPlan: tourSeed.fullPlan,
        maxParticipants: tourSeed.maxParticipants,
        freeSpots: tourSeed.freeSpots,
        price: tourSeed.price,
        startDate: daysFromNow(tourSeed.startInDays),
        endDate: daysFromNow(tourSeed.startInDays + tourSeed.durationDays),
        images: tourSeed.images,
        isClosed: false,
        isDraft: false,
      },
    })

    await prisma.tourSignup.deleteMany({ where: { tourId: tourSeed.id } })
    await prisma.tourSignup.createMany({
      data: tourSeed.participants.flatMap((contact) => {
        const userId = usersByContact.get(contact)
        return userId ? [{ tourId: tourSeed.id, userId }] : []
      }),
      skipDuplicates: true,
    })
  }

  for (const reviewSeed of reviews) {
    const userId = usersByContact.get(reviewSeed.userContact)
    const authorId = usersByContact.get(reviewSeed.authorContact)
    if (!userId || !authorId) continue

    await prisma.review.upsert({
      where: { id: reviewSeed.id },
      create: {
        id: reviewSeed.id,
        userId,
        authorId,
        text: reviewSeed.text,
        createdAt: daysAgo(reviewSeed.daysAgo),
      },
      update: {
        userId,
        authorId,
        text: reviewSeed.text,
        createdAt: daysAgo(reviewSeed.daysAgo),
      },
    })
  }

  console.log(
    `[seed] Ready demo data: ${seedAccounts.length} users, ${trips.length} trips, ${tours.length} tours, ${reviews.length} reviews`,
  )
  console.log(`[seed] Login accounts: ${seedAccounts.map((account) => account.contact).join(', ')}`)
}
