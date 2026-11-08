import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { application } from '../../fixtures/test-data'
import { PublisherApplicationPage } from '../../pages/publisher-application.page'

test('buyer can check the status of an existing publisher application', async ({ page }) => {
  await installApiMocks(page, 'buyer')
  await seedAuthenticatedRole(page, 'buyer')
  const form = new PublisherApplicationPage(page)
  await form.open('/publisher/apply')
  await waitForRouteReady(page, 'List a property')
  await expect(page.getByRole('heading', { name: /request submitted/i })).toBeVisible()
  await expect(page.getByText(`Your request for ${application.requested_role} access is being reviewed.`)).toBeVisible()
})

test('buyer can submit a publisher application', async ({ page }) => {
  await installApiMocks(page, 'buyer', {
    'GET my/publisher-application': { scenario: 'success', body: { data: null } },
    'POST my/publisher-application': { scenario: 'success', body: { data: application } },
  })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto('/publisher/apply')
  await waitForRouteReady(page, 'List a property')
  await page.getByLabel(/account access/i).selectOption('broker')
  await page.getByLabel(/prc license number/i).fill('PRC-7654321')
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('heading', { name: /request submitted/i })).toBeVisible()
})

test('broker publisher application requires a license and surfaces API validation', async ({ page }) => {
  await installApiMocks(page, 'buyer', {
    'GET my/publisher-application': { scenario: 'success', body: { data: null } },
    'POST my/publisher-application': 'validation',
  })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto('/publisher/apply')
  await waitForRouteReady(page, 'List a property')
  await page.getByLabel(/account access/i).selectOption('broker')
  const license = page.getByLabel(/prc license number/i)
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(license).toBeFocused()
  await license.fill('PRC-7654321')
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('alert')).toBeVisible()
})