import type { Page, Route } from '@playwright/test'
import { defaultApiResponse, endpointKey, overrideResponse, type ApiOverrides } from '../fixtures/api-fixtures'
import type { AppRole } from '../fixtures/test-data'

export async function installApiMocks(page: Page, role?: AppRole, overrides: ApiOverrides = {}) {
  await page.route('**/api/**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const key = endpointKey(request.method(), url.pathname)
    const fallback = defaultApiResponse(url.pathname, request.method(), role)
    const configured = overrides[key] ?? overrides[`${request.method().toUpperCase()} ${key.split(' ').slice(1).join(' ')}?*`]
    const response = configured ? overrideResponse(configured, fallback) : { status: 200, body: fallback }
    if (response.delayMs) await new Promise((resolve) => setTimeout(resolve, response.delayMs))
    await route.fulfill({ status: response.status, contentType: 'application/json', body: JSON.stringify(response.body) })
  })

  await page.route(/https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/, (route) => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rWQAAAAASUVORK5CYII=', 'base64'),
  }))
  await page.route('**/storage/**', (route) => route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rWQAAAAASUVORK5CYII=', 'base64'),
  }))
}
