import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuid } from 'uuid'
import { prisma } from '../lib/prisma.js'
import { toDbPost } from '../utils/serializers.js'
import { authRequired } from '../middleware/auth.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { routeParam } from '../utils/routeParam.js'

const router = Router()

const postSchema = z.object({
  text: z.string().min(1),
  image: z.string().optional(),
})

router.get('/', asyncHandler(async (req, res) => {
  const userId = req.query.userId as string | undefined
  const posts = await prisma.post.findMany({
    where: userId ? { userId } : undefined,
    orderBy: { createdAt: 'desc' },
  })
  res.json(posts.map(toDbPost))
}))

router.post('/', authRequired, asyncHandler(async (req, res) => {
  const data = postSchema.parse(req.body)
  const post = await prisma.post.create({
    data: {
      id: uuid(),
      userId: req.userId!,
      text: data.text,
      image: data.image,
    },
  })
  res.status(201).json(toDbPost(post))
}))

router.patch('/:id', authRequired, asyncHandler(async (req, res) => {
  const data = postSchema.partial().parse(req.body)
  const id = routeParam(req.params.id)
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    res.status(404).json({ error: 'Пост не найден' })
    return
  }
  if (post.userId !== req.userId) {
    res.status(403).json({ error: 'Нет доступа' })
    return
  }
  const updated = await prisma.post.update({
    where: { id: post.id },
    data,
  })
  res.json(toDbPost(updated))
}))

router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  const id = routeParam(req.params.id)
  const post = await prisma.post.findUnique({ where: { id } })
  if (!post) {
    res.status(404).json({ error: 'Пост не найден' })
    return
  }
  if (post.userId !== req.userId) {
    res.status(403).json({ error: 'Нет доступа' })
    return
  }
  await prisma.post.delete({ where: { id: post.id } })
  res.json({ message: 'Пост удалён' })
}))

export default router
