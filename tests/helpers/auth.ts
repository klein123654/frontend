import { expect, type Page } from '@playwright/test'
import type { AppRole } from '../fixtures/test-data'
import { users } from '../fixtures/test-data'
import { waitForRouteReady } from './route-smoke'

export async function seedAuthenticatedRole(page: Page, role: AppRole, accountStatus = 'active') {
  const user = { ...users[role], account_status: accountStatus }
  await page.addInitScript(({ token }) => localStorage.setItem('butuanspaces_auth_token', token), { token: `e2e-${role}-token` })
  return user
}

export async function signInAs(page: Page, role: AppRole) {
  const user = users[role]
  await page.goto('/login')
  await waitForRouteReady(page, 'Your space. Your opportunity.')
  await page.getByLabel(/email/i).fill(user.email)
  await page.locator('#login-password').fill('E2e-test-password-2026')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(role === 'buyer' ? /\/$/ : new RegExp(`/${role}/dashboard$`))
  return user
}
