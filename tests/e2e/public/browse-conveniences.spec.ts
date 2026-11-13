import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { listing } from '../../fixtures/test-data'

const twoPhotoListing = {
  ...listing,
  images: [
    { id: 1, path: '/storage/one.jpg', alt_text: 'one', sort_order: 0, is_primary: true },
    { id: 2, path: '/storage/two.jpg', alt_text: 'two', sort_order: 1, is_primary: false },
  ],
}

test.describe('browse conveniences', () => {
  test('results can be shown on a map', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/properties')
    await waitForRouteReady(page)

    await page.getByRole('button', { name: 'Map' }).click()
    await expect(page.getByRole('region', { name: 'Map of listings on this page' })).toBeVisible()
    await expect(page.getByText('Showing 1 of 1 listings on this page')).toBeVisible()
    await page.getByRole('button', { name: 'Grid' }).click()
    await expect(page.getByRole('link', { name: /Riverside Commercial Space/ })).toBeVisible()
  })

  test('visitors are invited to sign in for search alerts', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/properties?type=Warehouses')
    await waitForRouteReady(page)
    await expect(page.getByRole('link', { name: 'Sign in to get alerts for this search' })).toBeVisible()
  })

  test('signed-in buyer can save a filtered search', async ({ page }) => {
    let savedBody: unknown = null
    await installApiMocks(page, 'buyer')
    await page.route('**/api/my/saved-searches', async (route) => {
      if (route.request().method() !== 'POST') return route.fallback()
      savedBody = route.request().postDataJSON()
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ data: { id: 9, name: 'x', filters: {}, last_alerted_at: null, created_at: '' } }) })
    })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/properties')
    await waitForRouteReady(page)

    await expect(page.getByRole('button', { name: 'Save search & get email alerts' })).toBeDisabled()
    await page.goto('/properties?type=Warehouses&barangay=Bancasi')
    await waitForRouteReady(page)
    await page.getByRole('button', { name: 'Save search & get email alerts' }).click()

    await expect(page.getByText("Saved. We'll email you when new listings match.")).toBeVisible()
    expect(savedBody).toEqual({ name: 'Warehouses in Bancasi', filters: { property_type: 'Warehouses', barangay: 'Bancasi' } })
  })

  test('saved searches are listed on the saved page and can be removed', async ({ page }) => {
    await installApiMocks(page, 'buyer', {
      'GET my/saved-searches': { scenario: 'success', body: { data: [{ id: 4, name: 'Warehouses in Bancasi', filters: { property_type: 'Warehouses', barangay: 'Bancasi' }, last_alerted_at: null, created_at: '2026-11-01' }] } },
    })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/buyer/saved-properties')
    await waitForRouteReady(page, 'Saved Properties')

    const searches = page.getByRole('region', { name: 'Saved searches' })
    await expect(searches.getByRole('link', { name: 'See results' })).toHaveAttribute('href', /type=Warehouses/)
    await searches.getByRole('button', { name: 'Stop alerts for Warehouses in Bancasi' }).click()
    await expect(searches.getByText('No saved searches yet.')).toBeVisible()
  })

  test('listing photos open full screen and show price per square metre', async ({ page }) => {
    await installApiMocks(page, undefined, { [`GET properties/${listing.id}`]: { scenario: 'success', body: { data: twoPhotoListing } } })
    await page.goto(`/properties/${listing.id}`)
    await waitForRouteReady(page, listing.title)

    await expect(page.getByText('₱333 / sq. m.')).toBeVisible()
    await page.getByRole('button', { name: 'View photo full screen' }).click()
    const viewer = page.getByRole('dialog', { name: `${listing.title} photos` })
    await expect(viewer).toBeVisible()
    await expect(viewer.getByText('1 / 2')).toBeVisible()
    await page.keyboard.press('ArrowRight')
    await expect(viewer.getByText('2 / 2')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(viewer).toBeHidden()
  })

  test('legal and about pages are linked from the footer and accessible', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/')
    await waitForRouteReady(page)
    const footer = page.getByRole('contentinfo')
    await footer.getByRole('link', { name: 'Privacy Policy' }).click()
    await waitForRouteReady(page, 'Privacy Policy')
    await expectNoAxeViolations(page)

    await page.getByRole('contentinfo').getByRole('link', { name: 'Terms of Use' }).click()
    await waitForRouteReady(page, 'Terms of Use')
    await page.getByRole('contentinfo').getByRole('link', { name: 'About & FAQ' }).click()
    await waitForRouteReady(page, 'About ButuanSpaces')
    await expectNoAxeViolations(page)
  })
})
