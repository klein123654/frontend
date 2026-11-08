import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { listing, users } from '../../fixtures/test-data'
import { PropertyDetailsPage } from '../../pages/property-details.page'

test('visitor can open a property detail page', async ({ page }) => {
  await installApiMocks(page)
  const details = new PropertyDetailsPage(page)
  await details.open(`/properties/${listing.id}`)
  await expect(details.heading).toHaveText(listing.title)
  await expect(page.getByRole('heading', { name: /property overview/i })).toBeVisible()
})

test('buyer can save a property', async ({ page }) => {
  let saveRequestReceived = false
  await installApiMocks(page, 'buyer')
  await page.route(`**/api/my/saved-properties/${listing.id}`, async (route) => {
    saveRequestReceived = route.request().method() === 'POST'
    await route.fulfill({ json: { message: 'Property saved.' } })
  })
  await seedAuthenticatedRole(page, 'buyer')
  const details = new PropertyDetailsPage(page)
  await details.open(`/properties/${listing.id}`)
  await details.saveButton.click()
  await expect(page.getByRole('status')).toContainText(/saved/i)
  expect(saveRequestReceived).toBe(true)
})

test('buyer can submit an inquiry about a property', async ({ page }) => {
  let inquiryRequestReceived = false
  await installApiMocks(page, 'buyer', { [`POST properties/${listing.id}/inquiries`]: { scenario: 'success', body: { data: { id: 501 } } } })
  await page.route(`**/api/properties/${listing.id}/inquiries`, async (route) => {
    inquiryRequestReceived = route.request().method() === 'POST'
    await route.fulfill({ json: { data: { id: 501 } } })
  })
  await seedAuthenticatedRole(page, 'buyer')
  const details = new PropertyDetailsPage(page)
  await details.open(`/properties/${listing.id}`)
  await details.inquire('I would like to arrange a visit this week.')
  await expect(page.getByRole('status')).toContainText(/inquiry has been sent/i)
  expect(inquiryRequestReceived).toBe(true)
})

test('property detail shows validation and API failure feedback for inquiry submission', async ({ page }) => {
  await installApiMocks(page, 'buyer', { [`POST properties/${listing.id}/inquiries`]: 'validation' })
  await seedAuthenticatedRole(page, 'buyer')
  const details = new PropertyDetailsPage(page)
  await details.open(`/properties/${listing.id}`)
  await details.sendInquiryButton.click()
  await expect(page.getByText(/message must contain at least 10 characters/i)).toBeVisible()
  await details.inquiryMessage.fill('I would like a viewing.')
  await details.sendInquiryButton.click()
  await expect(page.getByRole('alert')).toBeVisible()
})

// See TESTING.md, App bugs found by tests: property detail server-error announcement.
test.fixme('property details report not-found and server-error states', async ({ page }) => {
  await installApiMocks(page, undefined, { 'GET properties/999': { scenario: 'error', status: 404, body: { message: 'Property not found.' } } })
  await page.goto('/properties/999')
  await waitForRouteReady(page, 'Property Not Found')
  await expect(page.getByRole('heading', { name: /property not found/i })).toBeVisible()
  await page.unrouteAll()
  await installApiMocks(page, undefined, { 'GET properties/101': 'error' })
  await page.goto('/properties/101')
  await waitForRouteReady(page, 'Property Not Found')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('property detail page has no axe violations', async ({ page }) => {
  await installApiMocks(page)
  await page.goto(`/properties/${listing.id}`)
  await expectNoAxeViolations(page)
})