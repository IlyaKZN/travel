import { prisma } from '../lib/prisma.js'
import { hashPassword } from '../utils/helpers.js'

const seedAccounts = [
  { contact: 'dumkin215@yandex.ru', password: '123456' },
  { contact: 'pich214@yandex.ru', password: '666666' },
  { contact: 'ilia.pichugin2014@yandex.ru', password: 'qwerty123' },
  { contact: 'test@yandex.ru', password: 'qwerty123' },
]

export async function seedDatabase() {
  for (const account of seedAccounts) {
    const contact = account.contact.trim().toLowerCase()
    const passwordHash = await hashPassword(account.password)

    await prisma.user.upsert({
      where: { contact },
      create: {
        contact,
        passwordHash,
        nickname: contact.split('@')[0].slice(0, 15),
      },
      update: {
        passwordHash,
      },
    })
  }

  console.log(`[seed] Ready login accounts: ${seedAccounts.map((account) => account.contact).join(', ')}`)
}
