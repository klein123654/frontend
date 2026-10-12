
import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('http://localhost:5173/')

  await expect(page.locator('body')).toContainText('ButuanSpaces')
})

test('property listings page loads', async ({ page }) => {
  await page.goto('http://localhost:5173/properties')

  await expect(
    page.getByText('Modern Commercial Office Space').first()
  ).toBeVisible()
})

test('property details page loads', async ({ page }) => {
  await page.goto('http://localhost:5173/properties/1')

  await expect(
    page.getByRole('heading', {
      name: 'Modern Commercial Office Space'
    })
  ).toBeVisible()
})

test('property gallery navigation works', async ({ page }) => {
  await page.goto('http://localhost:5173/properties/1')

  await expect(page.locator('.image-counter')).toHaveText('1 / 4')

  await page.getByRole('button', { name: 'Next image' }).click()

  await expect(page.locator('.image-counter')).toHaveText('2 / 4')

  await page.getByRole('button', { name: 'Previous image' }).click()

  await expect(page.locator('.image-counter')).toHaveText('1 / 4')
})

test('inquiry form shows validation errors', async ({ page }) => {
  await page.goto('http://localhost:5173/properties/1')

  await page.getByRole('button', { name: 'Preview Inquiry' }).click()

  await expect(
    page.getByText('Please enter your name.')
  ).toBeVisible()

  await expect(
    page.getByText('Please enter a valid email address.')
  ).toBeVisible()
})

test('valid inquiry displays demo confirmation', async ({ page }) => {
  await page.goto('http://localhost:5173/properties/1')

  await page.getByLabel('Full Name').fill('Test User')
  await page.getByLabel('Email Address').fill('test@example.com')
  await page.getByLabel('Your Message').fill(
    'I would like more information about this property.'
  )

  await page.getByRole('button', { name: 'Preview Inquiry' }).click()

  await expect(
    page.getByText('Form validation successful!')
  ).toBeVisible()

  await expect(
    page.getByText('Your message has not been sent or saved.', {
      exact: false
    })
  ).toBeVisible()
})
