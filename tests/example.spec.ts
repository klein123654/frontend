
import { test, expect } from '@playwright/test'
import { mockPublicPropertyApi } from './api-mocks'

test('homepage loads successfully', async ({ page }) => {
  await mockPublicPropertyApi(page)
  await page.goto('/')

  await expect(page.locator('body')).toContainText('ButuanSpaces')
})

test('property listings page loads', async ({ page }) => {
  await mockPublicPropertyApi(page)
  await page.goto('/properties')

  await expect(
    page.getByText('Playwright Commercial Office').first()
  ).toBeVisible()
})

test('property details page loads', async ({ page }) => {
  await mockPublicPropertyApi(page)
  await page.goto('/properties/1')

  await expect(
    page.getByRole('heading', {
      name: 'Playwright Commercial Office'
    })
  ).toBeVisible()
})

test('guest inquiry prompts sign in', async ({ page }) => {
  await mockPublicPropertyApi(page)
  await page.goto('/properties/1')

  await expect(page.getByRole('heading', { name: 'Sign in to inquire' })).toBeVisible()
  await page.getByRole('link', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?redirect=\/?properties\/1/)
})
