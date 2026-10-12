
import { test, expect } from '@playwright/test'

const brokerPages = [
  { name: 'Dashboard', path: '/broker/dashboard' },
  { name: 'My Listings', path: '/broker/listings' },
  { name: 'Add Listing', path: '/broker/listings/create' },
  { name: 'Inquiries', path: '/broker/inquiries' },
  { name: 'Profile', path: '/broker/profile' }
]

test.describe('ButuanSpaces Broker Workspace', () => {
  for (const page of brokerPages) {
    test(`${page.name} loads successfully`, async ({
      page: browserPage
    }) => {
      const response = await browserPage.goto(page.path)

      expect(response?.ok()).toBeTruthy()

      await expect(
        browserPage.locator('body')
      ).toBeVisible()

      await expect(
        browserPage.getByText('404', { exact: true })
      ).toHaveCount(0)

      // The broker sidebar should be visible.
      await expect(
        browserPage.locator('.sidebar')
      ).toBeVisible()

      // Public navigation must not appear in the workspace.
      await expect(
        browserPage.locator('header').filter({
          hasText: 'Log In'
        })
      ).toHaveCount(0)

      await browserPage.screenshot({
        path: `test-results/broker-${page.name
          .toLowerCase()
          .replaceAll(' ', '-')}.png`,
        fullPage: true
      })
    })
  }

  test('Broker sidebar navigates to My Listings', async ({
    page
  }) => {
    await page.goto('/broker/dashboard')

    await page
      .getByRole('link', { name: 'My Listings' })
      .click()

    await expect(page).toHaveURL(/\/broker\/listings$/)
  })

  test('Broker dashboard displays statistics', async ({
    page
  }) => {
    await page.goto('/broker/dashboard')

    await expect(
      page.getByText('Total Listings', { exact: true })
    ).toBeVisible()

    await expect(
      page.getByText('Approved Listings', { exact: true })
    ).toBeVisible()

    await expect(
      page.getByText('Total Inquiries', { exact: true })
    ).toBeVisible()
  })
})
