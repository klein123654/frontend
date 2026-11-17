import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { inquiry, inquiryMessage, users } from '../../fixtures/test-data'
import { BuyerInquiriesPage } from '../../pages/buyer-inquiries.page'
import { ListingWorkspaceInquiriesPage } from '../../pages/listing-workspace-inquiries.page'

const draft = 'Hi Bea, thanks for your interest. [confirm parking availability] Would Thursday work for a viewing?'

test.describe('AI assistance in conversations', () => {
  test('publisher can insert an AI reply draft and is told to check placeholders', async ({ page }) => {
    await installApiMocks(page, 'owner', {
      [`POST inquiries/${inquiry.id}/suggest-reply`]: { scenario: 'success', body: { reply: draft } },
    })
    await seedAuthenticatedRole(page, 'owner')
    await page.goto('/owner/inquiries')
    await waitForRouteReady(page)
    const inquiries = new ListingWorkspaceInquiriesPage(page, '/owner')
    await page.getByRole('button', { name: new RegExp(`View inquiry from ${users.buyer.name}`, 'i') }).click()
    await inquiries.conversationButtons.click()

    const panel = page.locator('.conversation-panel')
    await panel.getByRole('button', { name: 'Suggest a reply' }).click()
    await expect(inquiries.replyInput).toHaveValue(draft)
    await expect(panel.getByRole('status')).toContainText('Replace the parts in [brackets]')
  })

  test('publisher sees a clear message when AI drafting is unavailable', async ({ page }) => {
    await installApiMocks(page, 'owner', {
      [`POST inquiries/${inquiry.id}/suggest-reply`]: { scenario: 'error', status: 503, body: { message: 'AI features are not available right now.', type: 'ai_unavailable' } },
    })
    await seedAuthenticatedRole(page, 'owner')
    await page.goto('/owner/inquiries')
    await waitForRouteReady(page)
    const inquiries = new ListingWorkspaceInquiriesPage(page, '/owner')
    await page.getByRole('button', { name: new RegExp(`View inquiry from ${users.buyer.name}`, 'i') }).click()
    await inquiries.conversationButtons.click()
    await page.locator('.conversation-panel').getByRole('button', { name: 'Suggest a reply' }).click()
    await expect(page.locator('.conversation-panel').getByRole('alert')).toHaveText('AI features are not available right now.')
    await expect(inquiries.replyInput).toHaveValue('')
  })

  test('buyer sees a safety warning on a reply that asks for money', async ({ page }) => {
    const risky = {
      ...inquiryMessage,
      id: 503,
      sender_id: users.owner.id,
      sender: { id: users.owner.id, name: users.owner.name },
      body: 'Send the ₱5,000 reservation fee via GCash today to hold it.',
      safety_warning: 'Asks for a reservation fee before any viewing.',
    }
    await installApiMocks(page, 'buyer', {
      [`GET inquiries/${inquiry.id}/messages`]: { scenario: 'success', body: { data: [inquiryMessage, risky] } },
    })
    await seedAuthenticatedRole(page, 'buyer')
    const inquiries = new BuyerInquiriesPage(page)
    await inquiries.open('/buyer/inquiries')
    await waitForRouteReady(page, 'My Inquiries')
    await inquiries.conversationButtons.click()

    const warnings = page.getByRole('dialog').getByRole('note')
    await expect(warnings).toHaveCount(1)
    await expect(warnings).toContainText('Be careful. Asks for a reservation fee before any viewing.')
    await expect(warnings).toContainText('Never send a deposit or reservation fee')
  })
})

test('market insight keeps rent and sale prices apart and labels the AI summary', async ({ page }) => {
  await installApiMocks(page, 'owner', {
    'GET ai/market-insight': {
      scenario: 'success',
      body: {
        success: true,
        summary: 'Retail spaces and offices each have 3 listings.',
        ai_written: true,
        aggregates: {
          total_listings: 6,
          by_type: [{
            property_type: 'Retail Spaces',
            listing_count: 3,
            prices: [
              { listing_type: 'rent', label: 'For rent', listing_count: 2, median_price: 25000, median_price_per_sqm: 350, price_unit: 'per month' },
              { listing_type: 'sale', label: 'For sale', listing_count: 1, median_price: 5000000, median_price_per_sqm: 25000, price_unit: 'total asking price' },
            ],
          }],
          top_barangays: [{ barangay: 'Libertad', listing_count: 3 }],
        },
      },
    },
  })
  await seedAuthenticatedRole(page, 'owner')
  await page.goto('/owner/dashboard')
  await waitForRouteReady(page)
  const widget = page.locator('.market-insight-widget')
  await expect(widget).toContainText('Summary written by AI from the figures below.')
  await expect(widget).toContainText('For rent (2)')
  await expect(widget).toContainText('/ month')
  await expect(widget).toContainText('For sale (1)')
  await expect(widget).toContainText('Libertad')
})
