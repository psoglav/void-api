import { describe, test, expect } from 'vitest'
import { List } from '@prisma/client'
import api from '@/api'

describe('List', () => {
  let list: { data: List } | null = null

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

    list = await res.json() as { data: List }

    expect(list).toEqual({
      data: {
        id: expect.any(String),
        name
      }
    })
  })

  test('DELETE /list deletes a list', async () => {
    const res = await api.request(`/list/${list?.data.id}`, {
      method: 'DELETE'
    })

    expect(res.status).toBe(200)
  })

  test('GET /list has some data', async () => {
    const res = await api.request('/list')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      data: expect.any(Array)
    })
  })
})
