import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import authRoutes from './routes/auth.routes.js'
import usersRoutes from './routes/users.routes.js'
import postsRoutes from './routes/posts.routes.js'
import toursRoutes from './routes/tours.routes.js'
import tripsRoutes from './routes/trips.routes.js'
import chatsRoutes from './routes/chats.routes.js'
import pushRoutes from './routes/push.routes.js'
import notificationsRoutes from './routes/notifications.routes.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: config.corsOrigin, credentials: true }))
  app.use(express.json({ limit: '50mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', usersRoutes)
  app.use('/api/posts', postsRoutes)
  app.use('/api/tours', toursRoutes)
  app.use('/api/trips', tripsRoutes)
  app.use('/api/chats', chatsRoutes)
  app.use('/api/push', pushRoutes)
  app.use('/api/notifications', notificationsRoutes)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
