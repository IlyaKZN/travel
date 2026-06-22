import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/helpers.js'

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется авторизация' })
    return
  }
  const token = header.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Недействительный токен' })
    return
  }
  req.userId = payload.userId
  next()
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const payload = verifyToken(header.slice(7))
    if (payload) req.userId = payload.userId
  }
  next()
}
