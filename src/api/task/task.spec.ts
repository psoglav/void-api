import { describe, test, expect } from 'vitest'
import { Task } from '@prisma/client'
import api from '@/api'
import { FAKE_ID } from '@/test/helpers/constants'

describe('Task', () => {
  const text = "Write tests using Vitest"
  let task: Task | null = null

  test('POST /task creates a task', async () => {
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

  test('POST /task returns 404 List not found', async () => {
    const res = await api.request('/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        list_id: FAKE_ID
      })
    })

    expect(res.status).toBe(404)

    expect(await res.json()).toEqual({
      success: false,
      message: 'List not found'
    })
  })

  test('PUT /task/:id updates a task', async () => {
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

  test('PUT /task/:id returns 404', async () => {
    const res = await api.request(`/task/${FAKE_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Updated task'
      })
    })
    expect(res.status).toBe(404)
  })

  test('PUT /task/:id returns 404 List not found', async () => {
    const res = await api.request(`/task/${task?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        list_id: FAKE_ID
      })
    })

    expect(res.status).toBe(404)

    expect(await res.json()).toEqual({
      success: false,
      message: 'List not found'
    })
  })

  test('PUT /task/:id returns 400 Nothing to update', async () => {
    const res = await api.request(`/task/${task?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: '{}'
    })

    expect(res.status).toBe(400)

    expect(await res.json()).toEqual({
      success: false,
      message: 'Nothing to update'
    })
  })

  test('GET /task/:id returns a task by id', async () => {
    const res = await api.request(`/task/${task?.id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Object)
    })
  })

  test('GET /task returns a task by list_id', async () => {
    const res = await api.request(`/task?list_id=${FAKE_ID}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Array)
    })
  })

  test('GET /task/:id returns a task by text', async () => {
    const res = await api.request(`/task?text=${text.slice(0, 5)}`)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      data: expect.any(Array)
    })
  })

  test('GET /task returns many tasks', async () => {
    const res = await api.request('/task')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Array)
    })
  })

  test('DELETE /task/:id deletes a task', async () => {
    const res = await api.request(`/task/${task?.id}`, {
      method: 'DELETE'
    })

    expect(res.status).toBe(200)
  })

  test('DELETE /task/:id returns 404', async () => {
    const res = await api.request(`/task/${FAKE_ID}`, {
      method: 'DELETE'
    })
    expect(res.status).toBe(404)
  })
})
