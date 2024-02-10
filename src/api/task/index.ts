import { Hono, Context } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import prisma from '../../prisma/client'

const router = new Hono()

const TaskSchema = z.object({
  text: z.string(),
  list_id: z.string().length(36).optional()
})

router.get(
  '/:id?',
  zValidator('param', z.object({
    id: z.string().length(36).optional(),
  })),
  zValidator('query', z.object({
    list_id: z.string().length(36).optional(),
  })),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    const { list_id } = ctx.req.valid('query')

    if (!id && !list_id) return ctx.json({
      data: await prisma.task.findMany()
    })

    if (id) {
      const task = await prisma.task.findUnique({
        where: {
          id,
        }
      })

      if (!task) return ctx.notFound()

      return ctx.json({
        data: task
      })
    }

    const tasks = await prisma.task.findMany({
      where: {
        list_id
      }
    })

    return ctx.json({
      data: tasks
    })
  }
)

router.post('/', zValidator('json', TaskSchema), async (ctx) => {
  const { text, list_id } = ctx.req.valid('json')
  try {
    if (list_id) {
      const list = await prisma.list.findUnique({ where: { id: list_id } })

      if (!list) {
        ctx.status(404)
        return ctx.json({
          success: false,
          message: 'List not found'
        })
      }
    }

    const task = await prisma.task.create({
      data: {
        text,
        list_id
      },
    })
    return ctx.json({ data: task })
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
  zValidator('json', TaskSchema),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    const { text, list_id } = ctx.req.valid('json')
    try {
      if (list_id) {
        const list = await prisma.list.findUnique({ where: { id: list_id } })

        if (!list) {
          ctx.status(404)
          return ctx.json({
            success: false,
            message: 'List not found'
          })
        }
      }

      const task = await prisma.task.update({
        where: {
          id
        },
        data: {
          text,
          list_id
        },
      })
      return ctx.json({ success: true, data: task })
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
      await prisma.task.delete({
        where: {
          id
        },
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
