import { describe, test, expect } from 'vitest'
import { Task } from '@prisma/client'
import api from '@/api'

describe('Task', () => {
  let task: { data: Task } | null = null

  test('POST /task creates a task', async () => {
    const text = "Write tests using Vitest"
    const res = await api.request('/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
      })
    })

    expect(res.status).toBe(200)

    task = await res.json() as { data: Task }

    expect(task).toEqual({
      data: {
        id: expect.any(String),
        text,
        list_id: null
      }
    })
  })

  test('DELETE /task deletes a task', async () => {
    const res = await api.request(`/task/${task?.data.id}`, {
      method: 'DELETE'
    })

    expect(res.status).toBe(200)
  })

  test('GET /task has some data', async () => {
    const res = await api.request('/task')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Array)
    })
  })
})
