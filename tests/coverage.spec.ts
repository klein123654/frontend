import { expect, test } from '@playwright/test'
import { installApiMocks } from './helpers/api-mocks'
import { seedAuthenticatedRole } from './helpers/auth'
import { waitForRouteReady } from './helpers/route-smoke'
import { inquiry, listing, pendingListing, users } from './fixtures/test-data'
import { PropertiesPage } from './pages/properties.page'
import { PropertyDetailsPage } from './pages/property-details.page'
import { BuyerSavedPropertiesPage } from './pages/buyer-saved-properties.page'
import { BuyerInquiriesPage } from './pages/buyer-inquiries.page'
import { ListingWorkspacePropertyFormPage } from './pages/listing-workspace-property-form.page'
import { ListingWorkspaceInquiriesPage } from './pages/listing-workspace-inquiries.page'
import { AdminPropertiesPage } from './pages/admin-properties.page'

async function setupRole(page: import('@playwright/test').Page, role: 'buyer' | 'owner' | 'admin') {
  await installApiMocks(page, role)
  await seedAuthenticatedRole(page, role)
}

async function fillDraftForm(page: import('@playwright/test').Page, title: string) {
  await page.locator('#property-title').fill(title)
  await page.locator('#property-type').click()
  await page.getByRole('option', { name: 'Office Spaces' }).click()
  await page.locator('#listing-type').click()
  await page.getByRole('option', { name: 'For Rent' }).click()
  await page.locator('#property-barangay').fill('Baan KM 3')
  await page.locator('#property-location').fill('12 Riverside Road')
  await page.locator('#property-price').fill('50000')
  await page.locator('#property-area').fill('150')
  await page.locator('#property-description').fill('A bright commercial space close to the city center.')
}

test('visitor can browse published property listings', async ({ page }) => {
  await installApiMocks(page)
  await new PropertiesPage(page).open('/properties')
  await expect(page.getByRole('link', { name: /Riverside Commercial Space/i })).toBeVisible()
})

test('visitor can filter property listings', async ({ page }) => {
  await installApiMocks(page)
  const properties = new PropertiesPage(page)
  await properties.open('/properties')
  await properties.searchInput.fill('Riverside')
  await expect(properties.listingLinks.first()).toBeVisible()
})

test('visitor can open a property detail page', async ({ page }) => {
  await installApiMocks(page)
  await new PropertyDetailsPage(page).open(`/properties/${listing.id}`)
  await expect(page.getByRole('heading', { name: listing.title })).toBeVisible()
})

test('buyer can save a property', async ({ page }) => {
  await setupRole(page, 'buyer')
  await new PropertyDetailsPage(page).open(`/properties/${listing.id}`)
  await page.getByRole('button', { name: /save property/i }).click()
  await expect(page.getByRole('status')).toContainText(/saved/i)
})

test('buyer can unsave a property', async ({ page }) => {
  await setupRole(page, 'buyer')
  await new BuyerSavedPropertiesPage(page).open('/buyer/saved-properties')
  await page.getByRole('button', { name: /remove/i }).click()
  await expect(page.getByRole('heading', { name: /no saved properties yet/i })).toBeVisible()
})

test('buyer can submit an inquiry about a property', async ({ page }) => {
  await setupRole(page, 'buyer')
  const details = new PropertyDetailsPage(page)
  await details.open(`/properties/${listing.id}`)
  await details.inquire('I would like to arrange a visit this week.')
  await expect(page.getByRole('status')).toContainText(/inquiry has been sent/i)
})

test('buyer can view their own inquiries and status', async ({ page }) => {
  await setupRole(page, 'buyer')
  await new BuyerInquiriesPage(page).open('/buyer/inquiries')
  await expect(page.getByText('in progress')).toBeVisible()
  await expect(page.getByText(listing.title)).toBeVisible()
})

test('owner can create a property listing draft', async ({ page }) => {
  await setupRole(page, 'owner')
  await page.goto('/owner/properties/create')
  await waitForRouteReady(page, 'Add New Property')
  const form = new ListingWorkspacePropertyFormPage(page)
  await fillDraftForm(page, 'Draft Riverside Unit')
  await form.saveDraftButton.click()
  await expect(page.getByRole('status').filter({ hasText: /draft saved/i })).toContainText('Draft Saved')
})

test('owner can submit a property listing for review', async ({ page }) => {
  await setupRole(page, 'owner')
  await page.goto('/owner/properties/create')
  await waitForRouteReady(page, 'Add New Property')
  const form = new ListingWorkspacePropertyFormPage(page)
  await fillDraftForm(page, 'Review Riverside Unit')
  await form.imageInput.setInputFiles({ name: 'listing.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rWQAAAAASUVORK5CYII=', 'base64') })
  await form.map.click({ position: { x: 120, y: 120 } })
  await form.submitReviewButton.click()
  await expect(page.getByRole('status').filter({ hasText: /listing submitted/i })).toContainText('Listing Submitted')
})

test('owner can view inquiries on their listings', async ({ page }) => {
  await setupRole(page, 'owner')
  const inquiries = new ListingWorkspaceInquiriesPage(page)
  await inquiries.open('/owner/inquiries')
  await expect(page.getByText(users.buyer.name)).toBeVisible()
  await expect(page.getByRole('link', { name: listing.title })).toBeVisible()
})

test('owner can reply in an inquiry thread', async ({ page }) => {
  await setupRole(page, 'owner')
  const inquiries = new ListingWorkspaceInquiriesPage(page)
  await inquiries.open('/owner/inquiries')
  await page.getByRole('button', { name: new RegExp(`View inquiry from ${users.buyer.name}`, 'i') }).click()
  await inquiries.conversationButtons.click()
  await inquiries.replyInput.fill('I can arrange a viewing on Friday.')
  await page.locator('.conversation-panel').getByRole('button', { name: /^send$/i }).click()
  await expect(page.locator('.conversation-panel')).toContainText('I can arrange a viewing on Friday.')
  expect(inquiry.id).toBe(205)
})

test('admin can approve a pending listing', async ({ page }) => {
  await setupRole(page, 'admin')
  const queue = new AdminPropertiesPage(page)
  await queue.open('/admin/properties')
  await queue.review(pendingListing.title)
  await page.getByRole('button', { name: /approve listing/i }).click()
  await expect(page.getByRole('status')).toContainText(/listing approved/i)
})