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

test('broker can submit verification details and see existing status', async ({ page }) => {
  await openBroker(page, '/broker/profile', { 'GET broker/verification': { scenario: 'success', body: { data: null } } })
  const profile = new BrokerProfilePage(page)
  await profile.license.fill('PRC-8765432')
  await profile.agency.fill('Northstar Realty')
  await profile.submitButton.click()
  await expect(page.getByText(/verification details submitted for review/i)).toBeVisible()
})

test('broker verification shows load and submit errors', async ({ page }) => {
  await openBroker(page, '/broker/profile', { 'GET broker/verification': 'error' })
  await expect(page.getByText(/server is temporarily unavailable/i)).toBeVisible()
  await page.unrouteAll()
  await openBroker(page, '/broker/profile', { 'POST broker/verification': 'error' })
  await page.locator('#license-number').fill('PRC-8765432')
  await page.getByRole('button', { name: /submit for review/i }).click()
  await expect(page.getByRole('status')).toContainText(/temporarily unavailable|unable to/i)
})