import { expect, test } from '@playwright/test'
import type { ApiOverrides } from '../../fixtures/api-fixtures'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { brokerListing, inquiry, users, verification } from '../../fixtures/test-data'
import { BrokerDashboardPage } from '../../pages/broker-dashboard.page'
import { BrokerListingsPage } from '../../pages/broker-listings.page'
import { BrokerListingFormPage } from '../../pages/broker-listing-form.page'
import { BrokerInquiriesPage } from '../../pages/broker-inquiries.page'
import { BrokerProfilePage } from '../../pages/broker-profile.page'

async function openBroker(page: import('@playwright/test').Page, path: string, overrides: ApiOverrides = {}) {
  await installApiMocks(page, 'broker', overrides)
  await seedAuthenticatedRole(page, 'broker')
  await page.goto(path)
  await waitForRouteReady(page)
}

test('broker dashboard links to listings and verification', async ({ page }) => {
  await openBroker(page, '/broker/dashboard')
  const dashboard = new BrokerDashboardPage(page)
  await expect(dashboard.heading).toHaveText('Dashboard Overview')
  await expect(dashboard.verificationLink).toBeVisible()
})

test('broker dashboard has no axe violations', async ({ page }) => {
  await openBroker(page, '/broker/dashboard')
  await expectNoAxeViolations(page)
})

test('broker can search and filter listings and open a draft', async ({ page }) => {
  await openBroker(page, '/broker/listings')
  const listings = new BrokerListingsPage(page)
  await listings.searchInput.fill('Brokered Riverside')
  await expect(page.getByText(brokerListing.title)).toBeVisible()
  await listings.statusFilter.click()
  await page.getByRole('option', { name: 'Draft' }).click()
  await expect(page.getByText(brokerListing.title)).toBeVisible()
  await page.getByRole('link', { name: `View ${brokerListing.title}` }).click()
  await expect(page.getByRole('heading', { name: 'Listing Details' })).toBeVisible()
})

test('unverified broker cannot create or edit listings', async ({ page }) => {
  await openBroker(page, '/broker/listings', {
    'GET broker/verification': { scenario: 'success', body: { data: { ...verification, status: 'pending' } } },
  })

  await expect(page.getByText('Your broker verification is pending or rejected. You cannot create or edit listings until verification is approved.').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Add Listing' })).toHaveCount(0)

  await page.goto('/broker/listings/create')
  await waitForRouteReady(page, 'Add New Listing')
  await expect(page.getByRole('heading', { name: 'Add New Listing' })).toBeVisible()
  await expect(page.getByText('Your broker verification is pending or rejected. You cannot create or edit listings until verification is approved.').first()).toBeVisible()
  await expect(page.locator('#broker-title')).toHaveCount(0)
})

// See TESTING.md: the broker save route redirects without a role=status success announcement.
test.fixme('broker can create a listing draft and validation is shown', async ({ page }) => {
  await openBroker(page, '/broker/listings/create')
  const form = new BrokerListingFormPage(page)
  await form.saveDraftButton.click()
  await expect(page.getByRole('alert')).toContainText(/title is required/i)
  await page.locator('#broker-title').fill('Broker Riverside Draft')
  await page.locator('#broker-barangay').fill('Baan KM 3')
  await page.locator('#broker-location').fill('12 Riverside Road')
  await page.locator('#broker-price').fill('50000')
  await page.locator('#broker-area').fill('150')
  await page.locator('#broker-description').fill('Commercial office near the city center.')
  await form.saveDraftButton.click()
  await expect(page.getByRole('status')).toContainText(/saved/i)
})

test('broker can filter inquiries, open details, and update status', async ({ page }) => {
  await openBroker(page, '/broker/inquiries')
  const inquiries = new BrokerInquiriesPage(page)
  await inquiries.searchInput.fill(users.buyer.name)
  await expect(page.getByText(users.buyer.name)).toBeVisible()
  await inquiries.viewButtons.first().click()
  await expect(page.getByRole('dialog', { name: /inquiry details/i })).toBeVisible()
  await page.getByRole('dialog', { name: /inquiry details/i }).getByRole('combobox', { name: 'In Progress', exact: true }).click()
  await page.getByRole('option', { name: 'Closed' }).click()
  await expect(page.getByRole('dialog', { name: /inquiry details/i }).getByRole('status')).toContainText(/status saved/i)
  await expect(page.getByText(inquiry.message)).toBeVisible()
})

test('broker inquiry list supports empty and server-error states', async ({ page }) => {
  await openBroker(page, '/broker/inquiries', { 'GET my/inquiries': 'empty' })
  await expect(page.getByRole('heading', { name: /no inquiries yet/i })).toBeVisible()
  await page.unrouteAll()
  await openBroker(page, '/broker/inquiries', { 'GET my/inquiries': 'error' })
  await expect(page.getByRole('heading', { name: /broker inquiries/i })).toBeVisible()
})

test('broker can submit PRC, DHSUD and firm details and sees the DHSUD notice', async ({ page }) => {
  let submitted: Record<string, unknown> | null = null
  await openBroker(page, '/broker/profile', {
    'GET broker/verification': { scenario: 'success', body: { data: null } },
    'POST broker/verification': { scenario: 'success', body: { message: 'Sent.', data: { ...verification, status: 'pending' } } },
  })
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/broker/verification')) submitted = request.postDataJSON() as Record<string, unknown>
  })
  const profile = new BrokerProfilePage(page)
  await expect(page.getByTestId('dhsud-notice')).toContainText(/checks with DHSUD every year/i)
  await profile.fillCredentials()
  await page.getByLabel('Butuan Realty Board').check()
  await profile.submitButton.click()
  await expect(page.getByText(/sent to an administrator for checking/i)).toBeVisible()
  await expect(page.getByTestId('credential-status')).toContainText(/waiting for admin review/i)
  expect(submitted).toMatchObject({ license_number: 'PRC-8765432', dhsud_registration_number: 'DHSUD-CRG-0101', firm_name: 'Northstar Realty', affiliations: ['Butuan Realty Board'] })
})

test('broker with expired credentials is told to renew before managing listings', async ({ page }) => {
  await openBroker(page, '/broker/listings', {
    'GET broker/verification': { scenario: 'success', body: { data: { ...verification, status: 'verified', credential_status: 'expired' } } },
  })
  await expect(page.getByRole('status').filter({ hasText: /expired/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /add listing/i })).toHaveCount(0)
})

test('broker verification shows load and submit errors', async ({ page }) => {
  await openBroker(page, '/broker/profile', { 'GET broker/verification': 'error' })
  await expect(page.getByText(/server is temporarily unavailable/i)).toBeVisible()
  await page.unrouteAll()
  await openBroker(page, '/broker/profile', { 'POST broker/verification': 'error' })
  const profile = new BrokerProfilePage(page)
  await profile.fillCredentials()
  await profile.submitButton.click()
  await expect(page.getByRole('status')).toContainText(/temporarily unavailable|unable to/i)
})
