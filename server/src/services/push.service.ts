import webpush from 'web-push'
import { prisma } from '../lib/prisma.js'
import { config } from '../config.js'

let configured = false

function ensureConfigured(): boolean {
  if (configured) return true
  if (!config.vapidPublicKey || !config.vapidPrivateKey) return false
  webpush.setVapidDetails(config.vapidSubject, config.vapidPublicKey, config.vapidPrivateKey)
  configured = true
  return true
}

export function getVapidPublicKey(): string | null {
  return config.vapidPublicKey || null
}

export interface PushPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } })
  if (!subscriptions.length) return

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.p256dh, auth: subscription.auth },
          },
          JSON.stringify(payload),
        )
      } catch (error) {
        const statusCode =
          error && typeof error === 'object' && 'statusCode' in error
            ? Number((error as { statusCode: number }).statusCode)
            : undefined
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => undefined)
        }
      }
    }),
  )
}
