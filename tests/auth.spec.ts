import { test, expect } from '@playwright/test'

test('login page opens in a clean browser session', async ({ page }) => {
  await page.goto('/login')

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole('heading', { name: 'Sign in to your account' })
  ).toBeVisible()
})

test('invalid credentials show an error without redirecting', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel('Email Address').fill('nobody-test@example.invalid')
  await page.locator('#login-password').fill('IncorrectPassword123!')
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page.locator('.demo-alert')).toBeVisible({ timeout: 10000 })
  await expect(page).toHaveURL(/\/login$/)
})
