import { describe, test, expect } from 'vitest'
import { List } from '@prisma/client'
import api from '@/api'
import { FAKE_ID } from '@/test/helpers/constants'

describe('List', () => {
  let list: List | null = null

  test('POST /list creates a list', async () => {
    const name = "Test List"
    const res = await api.request('/list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
      })
    })

    expect(res.status).toBe(200)

    const data = await res.json() as { data: List }

    expect(data).toEqual({
      data: {
        id: expect.any(String),
        name
      }
    })

    list = data.data
  })

  test('GET /list/:id returns a single list', async () => {
    const res = await api.request(`/list/${list?.id}`)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Object)
    })
  })

  test('GET /list returns many lists', async () => {
    const res = await api.request('/list')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Array)
    })
  })

  test('PUT /list/:id updates a list', async () => {
    const res = await api.request(`/list/${list?.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated List Name'
      })
    })

    expect(res.status).toBe(200)
  })

  test('PUT /list/:id returns 404', async () => {
    const res = await api.request(`/list/${FAKE_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated List Name'
      })
    })

    expect(res.status).toBe(404)
  })

  test('DELETE /list/:id deletes a list', async () => {
    const res = await api.request(`/list/${list?.id}`, {
      method: 'DELETE'
    })

    expect(res.status).toBe(200)
  })

  test('DELETE /list/:id returns 404', async () => {
    const res = await api.request(`/list/${FAKE_ID}`, {
      method: 'DELETE'
    })

    expect(res.status).toBe(404)
  })
})
