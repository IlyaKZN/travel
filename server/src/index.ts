import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { createApp } from './app.js'
import { config } from './config.js'
import { prisma } from './lib/prisma.js'
import { seedDatabase } from './services/seed.js'
import { setupChatWebSocket } from './ws/chat.js'

await prisma.$connect()
await seedDatabase()

const app = createApp()
const server = createServer(app)
const chatWs = setupChatWebSocket()

const wss = new WebSocketServer({ server, path: '/ws' })

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '/ws', `http://${req.headers.host ?? 'localhost'}`)
  const token = url.searchParams.get('token')
  chatWs.handleConnection(ws, token)
})

const shutdown = async () => {
  await prisma.$disconnect()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

server.listen(config.port, config.host, () => {
  console.log(`[server] http://${config.host}:${config.port}`)
  console.log(`[server] API: http://localhost:${config.port}/api`)
  console.log(`[server] WS:  ws://localhost:${config.port}/ws`)
})
