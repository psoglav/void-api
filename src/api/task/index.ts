import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import prisma from '@/prisma/client'

const router = new Hono()

const TaskSchema = z.object({
  text: z.string(),
  list_id: z.string().length(36).optional()
})

const TaskFiltersSchema = z.object({
  text: z.string().optional(),
  list_id: z.string().length(36).optional()
})

router.get(
  '/:id?',
  zValidator('param', z.object({
    id: z.string().length(36).optional(),
  })),
  zValidator('query', TaskFiltersSchema),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    const { list_id, text } = ctx.req.valid('query')

    if (!id && !list_id && !text) return ctx.json({
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
        OR: [{ text: { contains: text } }, { list_id }]
      }
    })

    if (!tasks) return ctx.notFound()

    return ctx.json({
      data: tasks
    })
  }
)

router.post('/', zValidator('json', TaskSchema), async (ctx) => {
  const { text, list_id } = ctx.req.valid('json')

  if (list_id && !(await prisma.list.findUnique({ where: { id: list_id } }))) {
    ctx.status(404)
    return ctx.json({
      success: false,
      message: 'List not found'
    })
  }

  const task = await prisma.task.create({
    data: {
      text,
      list_id
    },
  })

  return ctx.json({ data: task })
})

router.put(
  '/:id',
  zValidator('param', z.object({ id: z.string().length(36) })),
  zValidator('json', TaskSchema.partial()),
  async (ctx) => {
    const { id } = ctx.req.valid('param')
    const { text, list_id } = ctx.req.valid('json')

    if (!text && !list_id) {
      ctx.status(400)
      return ctx.json({
        success: false,
        message: 'Nothing to update'
      })
    }

    try {
      if (list_id && !(await prisma.list.findUnique({ where: { id: list_id } }))) {
        ctx.status(404)
        return ctx.json({
          success: false,
          message: 'List not found'
        })
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
    } catch (e: any) {
      if (e.code === "P2025") return ctx.notFound()
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
    } catch (e: any) {
      if (e.code === "P2025") return ctx.notFound()
    }
  }
)

export default router
