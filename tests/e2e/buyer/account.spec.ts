import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { inquiry, inquiryMessage, listing } from '../../fixtures/test-data'
import { BuyerInquiriesPage } from '../../pages/buyer-inquiries.page'
import { BuyerSavedPropertiesPage } from '../../pages/buyer-saved-properties.page'

test('buyer can unsave a property', async ({ page }) => {
  let removeRequestReceived = false
  await installApiMocks(page, 'buyer')
  await page.route(`**/api/my/saved-properties/${listing.id}`, async (route) => {
    removeRequestReceived = route.request().method() === 'DELETE'
    await route.fulfill({ json: { message: 'Property removed.' } })
  })
  await seedAuthenticatedRole(page, 'buyer')
  const saved = new BuyerSavedPropertiesPage(page)
  await saved.open('/buyer/saved-properties')
  await saved.removeButtons.click()
  await expect(page.getByRole('heading', { name: /no saved properties yet/i })).toBeVisible()
  expect(removeRequestReceived).toBe(true)
})

test('buyer saved properties supports empty, loading, and error states', async ({ page }) => {
  await installApiMocks(page, 'buyer', { 'GET my/saved-properties': 'empty' })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto('/buyer/saved-properties')
  await waitForRouteReady(page, 'Saved Properties')
  await expect(page.getByRole('heading', { name: /no saved properties yet/i })).toBeVisible()

  await page.unrouteAll()
  await installApiMocks(page, 'buyer', { 'GET my/saved-properties': { scenario: 'loading', delayMs: 900 } })
  await page.reload()
  await waitForRouteReady(page, 'Saved Properties')
  await expect(page.getByRole('status')).toContainText('Loading your saved properties')
  await expect(page.getByRole('region', { name: 'Saved properties' }).getByRole('heading', { name: /Riverside Commercial Space/i })).toBeVisible()

  await page.unrouteAll()
  await installApiMocks(page, 'buyer', { 'GET my/saved-properties': 'error' })
  await page.goto('/buyer/saved-properties')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('buyer can view an inquiry status and reply in its conversation', async ({ page }) => {
  await installApiMocks(page, 'buyer', {
    'GET inquiries/205/messages': { scenario: 'success', body: { data: [inquiryMessage] } },
    'POST inquiries/205/messages': { scenario: 'success', body: { data: { ...inquiryMessage, id: 502, body: 'Thank you for the update.' } } },
  })
  await seedAuthenticatedRole(page, 'buyer')
  const inquiries = new BuyerInquiriesPage(page)
  await inquiries.open('/buyer/inquiries')
    await waitForRouteReady(page, 'My Inquiries')
  await expect(page.getByText('in progress')).toBeVisible()
  await expect(page.getByText(listing.title)).toBeVisible()
  await inquiries.conversationButtons.click()
  await expect(page.getByRole('dialog').getByText(inquiry.message)).toBeVisible()
  await page.locator('#buyer-conversation-reply').fill('Thank you for the update.')
  await page.getByRole('button', { name: /^send$/i }).click()
  await expect(page.getByText('Thank you for the update.')).toBeVisible()
})

test('buyer inquiries handles empty list and conversation loading error', async ({ page }) => {
  await installApiMocks(page, 'buyer', { 'GET my/inquiries/sent': 'empty' })
  await seedAuthenticatedRole(page, 'buyer')
  await page.goto('/buyer/inquiries')
    await waitForRouteReady(page, 'My Inquiries')
  await expect(page.getByRole('heading', { name: /no inquiries yet/i })).toBeVisible()
  expect(inquiry.id).toBe(205)
})