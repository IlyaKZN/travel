export const config = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://travels:travels@localhost:5432/travels',
  jwtSecret: process.env.JWT_SECRET || 'travels-dev-secret-change-in-production',
  jwtExpiresIn: '7d',
  confirmCodeTtlMs: 15 * 60 * 1000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
