import { describe, test, expect } from 'vitest'
import { Task } from '@prisma/client'
import api from '@/api'

describe('Task', () => {
  let task: Task | null = null

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

    const data = await res.json() as { data: Task }

    expect(data).toEqual({
      data: {
        id: expect.any(String),
        text,
        list_id: null
      }
    })

    task = data.data
  })

  test('PUT /task updates a task', async () => {
    const res = await api.request(`/task/${task?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Updated task'
      })
    })

    expect(res.status).toBe(200)
  })

  test('DELETE /task deletes a task', async () => {
    const res = await api.request(`/task/${task?.id}`, {
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
