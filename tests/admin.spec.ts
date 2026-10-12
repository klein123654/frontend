import { test, expect } from '@playwright/test'

const adminPages = [
  { path: '/admin/dashboard', heading: 'Dashboard Overview' },
  { path: '/admin/properties', heading: 'Property Approvals' },
  { path: '/admin/users', heading: 'User Management' },
  { path: '/admin/verifications', heading: 'Broker Verification' },
  { path: '/admin/inquiries', heading: 'Inquiries Management' },
  { path: '/admin/reports', heading: 'Bug Reports' }
]

test.describe('Admin Workspace pages', () => {
  for (const item of adminPages) {
    test(`${item.path} loads`, async ({ page }) => {
      const response = await page.goto(item.path)
      expect(response?.ok()).toBeTruthy()
      await expect(page.getByRole('heading', { name: item.heading, level: 1 })).toBeVisible()
      await expect(page.locator('#dashboard-sidebar')).toBeVisible()
    })
  }

  test('Admin sidebar navigation works', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.locator('#dashboard-sidebar').getByRole('link', { name: 'Manage Properties' }).click()
    await expect(page).toHaveURL(/\/admin\/properties$/)
    await page.locator('#dashboard-sidebar').getByRole('link', { name: 'Inquiries' }).click()
    await expect(page).toHaveURL(/\/admin\/inquiries$/)
  })

  test('Admin dashboard starts without manufactured accounts', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.getByText('Pending Property Reviews')).toBeVisible()
    await expect(page.getByText('No real', { exact: false })).toHaveCount(0)
  })
})
