import { describe, test, expect } from "vitest"
import api from '@/api'

describe("API", () => {
  test("GET / returns API info", async () => {
    const res = await api.request('/')
    const info = await res.text()
    expect(info).toBe("version: 1.0")
  })
})