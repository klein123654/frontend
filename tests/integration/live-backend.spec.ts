import { expect, test } from '@playwright/test'
import { backendHealth } from '../helpers/backend-health'

test.describe('live backend @integration', () => {
  test.skip(process.env.E2E_LIVE !== '1', 'Set E2E_LIVE=1 to run live backend integration checks.')

  test('public properties API is healthy and returns a Laravel collection response', async ({ request }) => {
    const health = await backendHealth()
    test.skip(!health.healthy, `Live backend unavailable: ${health.message}`)
    const apiBase = (process.env.E2E_API_URL || 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
    const response = await request.get(`${apiBase}/properties`)
    expect(response.ok(), `GET /api/properties returned ${response.status()}`).toBeTruthy()
    const body = await response.json() as { data?: unknown }
    expect(Array.isArray(body.data)).toBe(true)
  })
})