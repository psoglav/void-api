import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import prisma from '../../prisma/client'

const router = new Hono()

const ListSchema = z.object({
  name: z.string().min(2).max(24),
})

router.get(
  '/:id?',
  zValidator('param', z.object({ id: z.string().length(36).optional() })),
  async (ctx) => {
    const id = ctx.req.param('id')

    if (!id) return ctx.json({
      data: await prisma.list.findMany()
    })

    if (id.length !== 36) return ctx.notFound()

    const list = await prisma.list.findUnique({
      where: {
        id
      }
    })

    const tasks = await prisma.task.findMany({
      where: {
        list_id: id
      },
      select: {
        id: true,
        text: true
      }
    })

    if (!list) return ctx.notFound()

    return ctx.json({
      data: {
        ...list,
        tasks
      }
    })
  }
)

router.post('/', zValidator('json', ListSchema), async (ctx) => {
  const data = ctx.req.valid('json')
  try {
    const list = await prisma.list.create({
      data,
    })
    return ctx.json({ data: list })
  } catch {
    ctx.status(400)
    return ctx.json({
      success: false,
      message: 'Something went wrong'
    })
  }
})

router.put(
  '/:id',
  zValidator('param', z.object({ id: z.string().length(36) })),
  zValidator('json', ListSchema),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    const data = ctx.req.valid('json')
    try {
      const list = await prisma.list.update({
        where: {
          id
        },
        data,
      })
      return ctx.json({ success: true, data: list })
    } catch {
      ctx.status(400)
      return ctx.notFound()
    }
  }
)

router.delete(
  '/:id',
  zValidator('param', z.object({ id: z.string().length(36) })),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    try {
      const list = await prisma.list.delete({
        where: {
          id
        },
      })
      await prisma.task.deleteMany({
        where: {
          list_id: list.id
        }
      })
      return ctx.json({ success: true })
    } catch {
      ctx.status(400)
      return ctx.json({
        success: false,
        message: 'Something went wrong'
      })
    }
  }
)

export default router
