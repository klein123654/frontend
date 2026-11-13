import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { ROUTES, waitForRouteReady } from '../../helpers/route-smoke'

test.describe('routed page smoke coverage', () => {
  test('registry includes all 44 router entries', () => {
    expect(ROUTES).toHaveLength(44)
  })

  for (const routeCase of ROUTES) {
    const roles = routeCase.guard ? routeCase.roles : [undefined]
    for (const role of roles) {
      const label = role ? `as ${role}` : 'as a visitor'
      test(`${routeCase.path} renders or redirects ${label}`, async ({ page }) => {
        const consoleErrors: string[] = []
        const uncaughtErrors: string[] = []
        page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
        page.on('pageerror', (error) => uncaughtErrors.push(error.message))
        await installApiMocks(page, role)
        if (role) await seedAuthenticatedRole(page, role)

        await page.goto(routeCase.path)
        await waitForRouteReady(page, routeCase.landmark)

        if (routeCase.redirectTo) {
          await expect(page).toHaveURL(new RegExp(`${routeCase.redirectTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`))
        } else {
          await expect(page.getByRole('heading', { level: 1, name: new RegExp(routeCase.landmark.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })).toBeVisible()
        }
        expect(uncaughtErrors, `Uncaught page errors at ${routeCase.path}`).toEqual([])
        expect(consoleErrors, `Console errors at ${routeCase.path}`).toEqual([])
      })
    }
  }
})
