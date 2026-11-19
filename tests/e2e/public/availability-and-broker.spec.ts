import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { brokeredPublicListing, brokerCredentials, listing, rentedPublicListing, users } from '../../fixtures/test-data'

const ownerListing = {
  ...listing,
  publisher: {
    id: users.owner.id, name: users.owner.name, role: 'owner', role_label: 'Property owner', verified: true,
    license_number: null, agency_name: null, member_since: '2026-10-01', broker: null,
    contact: { phone: null, email: null, messenger_url: null, viber_url: null },
  },
}
const catalog = [ownerListing, brokeredPublicListing, rentedPublicListing]

test('catalog shows colour-coded availability badges with a legend', async ({ page }) => {
  await installApiMocks(page, undefined, {
    'GET properties': { scenario: 'success', body: { data: catalog, meta: { current_page: 1, last_page: 1, per_page: 12, total: catalog.length } } },
  })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')

  const legend = page.getByTestId('availability-legend')
  await expect(legend).toContainText('Available')
  await expect(legend).toContainText('Reserved')
  await expect(legend).toContainText('Rented / Leased')
  await expect(legend).toContainText('Sold')

  const badges = page.locator('.property-card [data-testid="availability-badge"]')
  await expect(badges).toHaveText(['Available', 'Reserved', 'Rented / Leased'])
  await expect(page.getByTestId('card-listed-by').nth(1)).toHaveText(`Broker: ${users.broker.name} · ${brokerCredentials.firm_name}`)
  await expect(page.getByTestId('card-listed-by').first()).toHaveText('Listed directly by the owner')
  await expectNoAxeViolations(page)
})

test('availability filter is sent to the API and kept in the URL', async ({ page }) => {
  const requested: string[] = []
  await installApiMocks(page)
  page.on('request', (request) => {
    if (request.url().includes('/api/properties?')) requested.push(request.url())
  })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await page.getByLabel('Availability', { exact: true }).selectOption('available')
  await expect(page).toHaveURL(/availability=available/)
  await expect.poll(() => requested.some((url) => url.includes('availability=available'))).toBe(true)
})

test('map pins are coloured by availability and explained in a legend', async ({ page }) => {
  await installApiMocks(page, undefined, {
    'GET properties': { scenario: 'success', body: { data: catalog, meta: { current_page: 1, last_page: 1, per_page: 12, total: catalog.length } } },
  })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await page.getByRole('button', { name: 'Map' }).click()
  await expect(page.getByTestId('map-legend')).toContainText('Rented / Leased')
  await expect(page.locator('path.pin--reserved')).toHaveAttribute('fill', '#d97706')
  await expect(page.locator('path.pin--rented')).toHaveAttribute('fill', '#dc2626')
})

test('property page shows the broker, firm, PRC and DHSUD details and affiliations', async ({ page }) => {
  await installApiMocks(page, undefined, {
    [`GET properties/${brokeredPublicListing.id}`]: { scenario: 'success', body: { data: brokeredPublicListing } },
  })
  await page.goto(`/properties/${brokeredPublicListing.id}`)
  await waitForRouteReady(page)

  await expect(page.getByTestId('availability-badge').first()).toHaveText('Reserved')
  await expect(page.getByTestId('broker-firm')).toContainText(brokerCredentials.firm_name)
  await expect(page.getByTestId('broker-firm')).toContainText('Managing Broker')
  await expect(page.getByTestId('broker-credentials')).toContainText(brokerCredentials.license_number)
  await expect(page.getByTestId('broker-credentials')).toContainText(brokerCredentials.dhsud_registration_number)
  await expect(page.getByRole('list', { name: 'Professional affiliations' })).toContainText('Butuan Realty Board')
  await expect(page.getByText(/reserved while an offer is being negotiated/i)).toBeVisible()
  await expectNoAxeViolations(page)
})

test('rented listing stays visible but replaces the inquiry form', async ({ page }) => {
  await installApiMocks(page, 'buyer', {
    [`GET properties/${rentedPublicListing.id}`]: { scenario: 'success', body: { data: rentedPublicListing } },
  })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto(`/properties/${rentedPublicListing.id}`)
  await waitForRouteReady(page)

  await expect(page.getByTestId('availability-badge').first()).toHaveText('Rented / Leased')
  await expect(page.getByTestId('listing-unavailable')).toContainText('No longer available')
  await expect(page.getByRole('link', { name: /browse similar listings/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /send inquiry/i })).toHaveCount(0)
})

test('broker with expired credentials is shown as renewing', async ({ page }) => {
  const renewing = {
    ...brokeredPublicListing,
    publisher: { ...brokeredPublicListing.publisher, verified: false, broker: { ...brokeredPublicListing.publisher.broker, credential_status: 'expired' } },
  }
  await installApiMocks(page, undefined, { [`GET properties/${renewing.id}`]: { scenario: 'success', body: { data: renewing } } })
  await page.goto(`/properties/${renewing.id}`)
  await waitForRouteReady(page)
  await expect(page.getByText('Registration being renewed').first()).toBeVisible()
  await expect(page.getByRole('note').filter({ hasText: /being renewed/i })).toBeVisible()
})
