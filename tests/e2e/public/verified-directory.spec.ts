import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { listing, users } from '../../fixtures/test-data'

const publisher = {
  id: users.broker.id,
  name: users.broker.name,
  role: 'broker',
  role_label: 'Licensed broker',
  verified: true,
  license_number: 'PRC-0012345',
  agency_name: 'Agusan Realty',
  member_since: '2026-09-01',
  contact: { phone: '09171234567', email: 'brooke@example.test', messenger_url: 'https://m.me/brooke.broker', viber_url: null },
}
const verifiedListing = { ...listing, broker_id: users.broker.id, publisher }

test('property page shows the verified broker with direct contact and share options', async ({ page }) => {
  await installApiMocks(page, undefined, { [`GET properties/${listing.id}`]: { scenario: 'success', body: { data: verifiedListing } } })
  await page.goto(`/properties/${listing.id}`)
  await waitForRouteReady(page)

  await expect(page.getByText('PRC-licensed broker').first()).toBeVisible()
  await expect(page.getByText('License PRC-0012345').first()).toBeVisible()
  await expect(page.getByRole('link', { name: 'Call 09171234567' })).toHaveAttribute('href', 'tel:09171234567')
  await expect(page.getByRole('link', { name: 'Messenger', exact: true })).toHaveAttribute('href', 'https://m.me/brooke.broker')
  await expect(page.getByRole('group', { name: 'Share this listing' }).getByRole('link', { name: 'Facebook' }))
    .toHaveAttribute('href', new RegExp(`facebook\\.com/sharer/sharer\\.php\\?u=.*properties%2F${listing.id}`))
  await expect(page.getByRole('link', { name: /view profile and other listings/i })).toHaveAttribute('href', `/publishers/${users.broker.id}`)
  await expectNoAxeViolations(page)
})

test('visitor can report a listing without signing in', async ({ page }) => {
  let reportBody: Record<string, unknown> | null = null
  await installApiMocks(page)
  await page.route(`**/api/properties/${listing.id}/reports`, async (route) => {
    reportBody = route.request().postDataJSON() as Record<string, unknown>
    await route.fulfill({ status: 201, json: { message: 'Report submitted.' } })
  })
  await page.goto(`/properties/${listing.id}`)
  await waitForRouteReady(page)

  await page.getByRole('button', { name: /report this listing/i }).click()
  await page.getByLabel(/what’s wrong with this listing/i).selectOption('Already rented or sold')
  await page.getByLabel(/details/i).fill('The space was rented out last week.')
  await page.getByRole('button', { name: /send report/i }).click()

  await expect(page.getByRole('status').filter({ hasText: /administrator will review/i })).toBeVisible()
  expect(reportBody).toMatchObject({ reason: 'Already rented or sold', details: 'The space was rented out last week.' })
})

test('publisher profile shows credentials, contact and active listings', async ({ page }) => {
  await installApiMocks(page, undefined, {
    [`GET publishers/${users.broker.id}`]: { scenario: 'success', body: { data: { ...publisher, active_listing_count: 1 } } },
  })
  await page.goto(`/publishers/${users.broker.id}`)
  await waitForRouteReady(page)

  await expect(page.getByRole('heading', { level: 1, name: users.broker.name })).toBeVisible()
  await expect(page.getByText('Agusan Realty')).toBeVisible()
  await expect(page.getByText('License PRC-0012345')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Call 09171234567' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /active listings \(1\)/i })).toBeVisible()
  await expect(page.getByText(listing.title)).toBeVisible()
  await expect(page).toHaveTitle(new RegExp(`${users.broker.name} – Licensed broker in Butuan City`))
  await expectNoAxeViolations(page)
})

test('home page lists barangays that link to filtered results', async ({ page }) => {
  const requestedUrls: string[] = []
  await installApiMocks(page, undefined, {
    'GET barangays': { scenario: 'success', body: { data: [{ barangay: 'Libertad', listing_count: 4 }, { barangay: 'Baan', listing_count: 1 }] } },
  })
  page.on('request', (request) => { if (request.url().includes('/api/properties?')) requestedUrls.push(request.url()) })
  await page.goto('/')
  await waitForRouteReady(page)

  await expect(page.getByRole('heading', { name: 'Browse by barangay' })).toBeVisible()
  await expect(page.getByText('5 live listings in 2 barangays')).toBeVisible()
  await page.getByRole('link', { name: /Libertad/ }).click()

  await expect(page).toHaveURL(/\/properties\?barangay=Libertad/)
  await expect(page.getByLabel('Barangay')).toHaveValue('Libertad')
  await expect.poll(() => requestedUrls.some((url) => url.includes('barangay=Libertad'))).toBe(true)
})

test('owner can mark an approved listing as rented', async ({ page }) => {
  let sentAvailability: unknown = null
  await installApiMocks(page, 'owner')
  await page.route(`**/api/my/properties/${listing.id}/availability`, async (route) => {
    sentAvailability = (route.request().postDataJSON() as { availability: string }).availability
    await route.fulfill({ json: { data: { ...listing, availability: 'rented', availability_confirmed_at: new Date().toISOString() } } })
  })
  await seedAuthenticatedRole(page, 'owner')
  await page.goto(`/owner/properties/${listing.id}`)
  await waitForRouteReady(page)

  await expect(page.getByRole('heading', { name: 'Availability' })).toBeVisible()
  await page.getByRole('button', { name: 'Mark as rented' }).click()

  await expect(page.getByRole('status').filter({ hasText: /marked as rented/i })).toBeVisible()
  expect(sentAvailability).toBe('rented')
})

test('owner can save public contact details', async ({ page }) => {
  let savedBody: Record<string, unknown> | null = null
  await installApiMocks(page, 'owner')
  await page.route('**/api/user', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback()
    savedBody = route.request().postDataJSON() as Record<string, unknown>
    await route.fulfill({ json: { user: { ...users.owner, ...savedBody } } })
  })
  await seedAuthenticatedRole(page, 'owner')
  await page.goto('/owner/profile')
  await waitForRouteReady(page)

  await page.getByLabel(/mobile number/i).fill('09171234567')
  await page.getByLabel(/facebook \/ messenger/i).fill('https://www.facebook.com/owen.owner.ph')
  await page.getByRole('button', { name: /save contact details/i }).click()

  await expect(page.getByRole('status').filter({ hasText: /now appear on your listings/i })).toBeVisible()
  expect(savedBody).toMatchObject({ contact_phone: '09171234567', messenger_username: 'owen.owner.ph', contact_email: null })
  await expectNoAxeViolations(page)
})
