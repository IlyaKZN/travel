import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Некорректные данные', details: err.errors })
    return
  }
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Маршрут не найден' })
}
