import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { inquiry, listing, pendingListing, draftListing } from '../../fixtures/test-data'

const photoListing = {
  ...listing,
  // A valid Butuan barangay, so the edit form can be saved.
  barangay: 'Baan KM 3',
  views_count: 42,
  images: [
    { id: 11, path: '/storage/front.jpg', alt_text: 'front', sort_order: 0, is_primary: true },
    { id: 12, path: '/storage/inside.jpg', alt_text: 'inside', sort_order: 1, is_primary: false },
  ],
}

test.describe('publisher conveniences', () => {
  test('owner can choose a new cover and remove a photo when editing', async ({ page }) => {
    let sent: Record<string, string[]> = {}
    await installApiMocks(page, 'owner', {
      'GET my/properties': { scenario: 'success', body: { data: [photoListing, pendingListing, draftListing], meta: { current_page: 1, last_page: 1, total: 3 } } },
    })
    await page.route(`**/api/my/properties/${listing.id}`, async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      const body = route.request().postData() ?? ''
      sent = {}
      for (const match of body.matchAll(/name="([^"]+)"\r\n\r\n([^\r]*)/g)) (sent[match[1]!] ??= []).push(match[2]!)
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'Property updated.', data: { ...photoListing, status: 'published' } }) })
    })
    await seedAuthenticatedRole(page, 'owner')
    await page.goto(`/owner/properties/${listing.id}/edit`)
    await waitForRouteReady(page, 'Edit Property')

    const photos = page.getByRole('list', { name: 'Current listing photos' })
    await expect(photos.getByText('Cover')).toBeVisible()
    await photos.getByRole('button', { name: 'Make photo 2 the cover' }).click()
    await photos.getByRole('button', { name: 'Remove photo 2' }).click()
    await expect(photos.getByText('Will be removed')).toBeVisible()
    await photos.getByRole('button', { name: 'Keep photo 2' }).click()
    await photos.getByRole('button', { name: 'Remove photo 2' }).click()

    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect.poll(() => sent['remove_image_ids[]']).toEqual(['11'])
    expect(sent['primary_image_id']).toEqual(['12'])
  })

  test('sidebar shows how many inquiries await a reply and listing views', async ({ page }) => {
    await installApiMocks(page, 'owner', {
      'GET my/inquiries': { scenario: 'success', body: { data: [inquiry, { ...inquiry, id: 206, status: 'new' }, { ...inquiry, id: 207, status: 'new' }] } },
      'GET my/properties': { scenario: 'success', body: { data: [photoListing], meta: { current_page: 1, last_page: 1, total: 1 } } },
    })
    await seedAuthenticatedRole(page, 'owner')
    await page.goto(`/owner/properties/${listing.id}`)
    await waitForRouteReady(page)

    await expect(page.getByLabel('2 awaiting reply')).toBeVisible()
    await expect(page.getByText('Page Views')).toBeVisible()
    await expect(page.getByText('42', { exact: true })).toBeVisible()
  })
})
