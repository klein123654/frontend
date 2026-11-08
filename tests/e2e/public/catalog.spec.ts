import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { listing } from '../../fixtures/test-data'
import { HomePage } from '../../pages/home.page'
import { PropertiesPage } from '../../pages/properties.page'

test('visitor can browse published property listings', async ({ page }) => {
  await installApiMocks(page)
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await expect(page.getByRole('heading', { name: 'Explore Commercial Properties' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Riverside Commercial Space/i })).toBeVisible()
})

test('visitor can search from the home page and reach filtered results', async ({ page }) => {
  await installApiMocks(page)
  const home = new HomePage(page)
  await home.open('/')
  await home.search('Riverside')
  await expect(page).toHaveURL(/\/properties\?search=Riverside/)
  await expect(page.getByRole('heading', { name: /Explore Commercial Properties/i })).toBeVisible()
})

test('visitor can navigate back from a listing and retain browser navigation', async ({ page }) => {
  await installApiMocks(page)
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await page.getByRole('link', { name: /Riverside Commercial Space/i }).click()
  await expect(page).toHaveURL(/\/properties\/101$/)
  await page.goBack()
  await expect(page).toHaveURL(/\/properties$/)
  await expect(page.getByRole('heading', { name: /explore commercial properties/i })).toBeVisible()
})

test('visitor can filter property listings and reset filters', async ({ page }) => {
  const requestedUrls: URL[] = []
  await installApiMocks(page)
  await page.route('**/api/properties**', async (route) => {
    requestedUrls.push(new URL(route.request().url()))
    await route.fulfill({ json: { data: [listing], meta: { total: 1 } } })
  })
  const properties = new PropertiesPage(page)
  await properties.open('/properties')
  await properties.searchInput.fill('Riverside')
  await properties.propertyType.selectOption({ label: 'Office Spaces' }).catch(async () => {
    await properties.propertyType.click()
    await page.getByRole('option', { name: 'Office Spaces' }).click()
  })
  await expect.poll(() => requestedUrls.some((url) => url.searchParams.get('search') === 'Riverside' && url.searchParams.get('property_type') === 'Office Spaces')).toBeTruthy()
  await expect(properties.listingLinks.first()).toBeVisible()
  await page.getByRole('button', { name: /reset/i }).click()
  await expect(properties.searchInput).toHaveValue('')
})

test('visitor sees empty, loading, and API error states in the catalog', async ({ page }) => {
  await installApiMocks(page, undefined, { 'GET properties': { scenario: 'loading', delayMs: 900 } })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await expect(page.getByRole('status')).toBeVisible()
  await expect(page.getByRole('link', { name: /Riverside Commercial Space/i })).toBeVisible()

  await page.unrouteAll()
  await installApiMocks(page, undefined, { 'GET properties': 'empty' })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await expect(page.getByText(/no properties|no listings/i)).toBeVisible()

  await page.unrouteAll()
  await installApiMocks(page, undefined, { 'GET properties': 'error' })
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await expect(page.getByRole('alert')).toBeVisible()
})

test('catalog page has no axe violations', async ({ page }) => {
  await installApiMocks(page)
  await page.goto('/properties')
  await waitForRouteReady(page, 'Explore Commercial Properties')
  await expectNoAxeViolations(page)
})

test('public home page has no axe violations', async ({ page }) => {
  await installApiMocks(page)
  await page.goto('/')
  await waitForRouteReady(page, 'Make room for what your business does next')
  await expectNoAxeViolations(page)
})