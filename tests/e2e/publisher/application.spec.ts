import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { application } from '../../fixtures/test-data'
import { PublisherApplicationPage } from '../../pages/publisher-application.page'

async function fillBrokerCredentials(page: import('@playwright/test').Page, options: { license?: boolean } = {}) {
  const nextYear = new Date(Date.now() + 300 * 86_400_000).toISOString().slice(0, 10)
  if (options.license !== false) await page.locator('#apply-license-number').fill('PRC-7654321')
  await page.locator('#apply-prc-valid-until').fill(nextYear)
  await page.locator('#apply-dhsud-number').fill('DHSUD-CRG-0077')
  await page.locator('#apply-dhsud-valid-until').fill(nextYear)
  await page.locator('#apply-firm-name').fill('Agusan Prime Realty')
}

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
  await expect(page.getByTestId('dhsud-notice')).toContainText(/checks with DHSUD every year/i)
  await fillBrokerCredentials(page)
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('heading', { name: /request submitted/i })).toBeVisible()
})

test('developer is no longer an option and owners can give a business name', async ({ page }) => {
  let submitted: Record<string, unknown> | null = null
  await installApiMocks(page, 'buyer', {
    'GET my/publisher-application': { scenario: 'success', body: { data: null } },
    'POST my/publisher-application': { scenario: 'success', body: { data: application } },
  })
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/my/publisher-application')) submitted = request.postDataJSON() as Record<string, unknown>
  })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto('/publisher/apply')
  await waitForRouteReady(page, 'List a property')
  await expect(page.getByLabel(/account access/i).locator('option')).toHaveText([/property owner/i, /licensed broker/i])
  await page.getByLabel(/ownership type/i).selectOption('company')
  await page.getByLabel(/registered business name/i).fill('Agusan Land Development Corp.')
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('heading', { name: /request submitted/i })).toBeVisible()
  expect(submitted).toMatchObject({ requested_role: 'owner', ownership_type: 'company', business_name: 'Agusan Land Development Corp.' })
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
  const license = page.locator('#apply-license-number')
  await fillBrokerCredentials(page, { license: false })
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(license).toBeFocused()
  await license.fill('PRC-7654321')
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('alert')).toBeVisible()
})