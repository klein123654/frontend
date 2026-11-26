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

test.describe('listing map', () => {
  async function mapView(page: import('@playwright/test').Page) {
    const map = page.locator('.location-map').first()
    const [lat, lng] = (await map.getAttribute('data-center'))!.split(',').map(Number)
    return { lat: lat!, lng: lng!, zoom: Number(await map.getAttribute('data-zoom')) }
  }

  test('choosing a barangay moves the map there, and scrolling zooms the map', async ({ page }) => {
    await installApiMocks(page, 'owner')
    await seedAuthenticatedRole(page, 'owner')
    await page.goto('/owner/properties/create')
    await waitForRouteReady(page)
    await expect(page.locator('.location-map')).toHaveAttribute('data-zoom', '12')

    await page.locator('#property-barangay').fill('Bancasi')
    await expect.poll(async () => (await mapView(page)).zoom).toBe(16)
    const view = await mapView(page)
    expect(Math.abs(view.lat - 8.9516)).toBeLessThan(0.01)
    expect(Math.abs(view.lng - 125.4787)).toBeLessThan(0.01)

    await page.locator('.location-map').scrollIntoViewIfNeeded()
    const box = (await page.locator('.location-map').boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, -400)
    await expect.poll(async () => (await mapView(page)).zoom).toBeGreaterThan(16)
  })

  test('a pin far from a newly chosen barangay gets a note', async ({ page }) => {
    await installApiMocks(page, 'owner')
    await seedAuthenticatedRole(page, 'owner')
    await page.goto('/owner/properties/create')
    await waitForRouteReady(page)

    await page.locator('#property-barangay').fill('Bancasi')
    await expect.poll(async () => (await mapView(page)).zoom).toBe(16)
    await page.locator('.location-map').scrollIntoViewIfNeeded()
    const box = (await page.locator('.location-map').boundingBox())!
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)

    await page.locator('#property-barangay').fill('Ampayon')
    await expect(page.getByTestId('map-far-note')).toContainText('far from Ampayon')
    await page.locator('.location-map').scrollIntoViewIfNeeded()
    const moved = (await page.locator('.location-map').boundingBox())!
    await page.mouse.click(moved.x + moved.width / 2, moved.y + moved.height / 2)
    await expect(page.getByTestId('map-far-note')).toHaveCount(0)
  })

  test('public property maps keep normal page scrolling', async ({ page }) => {
    await installApiMocks(page)
    await page.goto(`/properties/${listing.id}`)
    await waitForRouteReady(page)
    const map = page.locator('.location-map').first()
    await map.scrollIntoViewIfNeeded()
    await expect(map).toHaveAttribute('data-zoom', '16')
    const box = (await map.boundingBox())!
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.wheel(0, -400)
    await page.waitForTimeout(500)
    await expect(map).toHaveAttribute('data-zoom', '16')
  })
})
