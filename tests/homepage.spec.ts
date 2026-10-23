import { expect, test } from '@playwright/test'

const properties = [
  {
    id: 711,
    title: 'Butuan Logistics Warehouse',
    property_type: 'Warehouses',
    listing_type: 'sale',
    description: 'Commercial warehouse space near key business routes.',
    price: '4200000',
    address_line: 'Bancasi, Butuan City',
    barangay: 'Bancasi',
    city: 'Butuan City',
    province: 'Agusan del Norte',
    floor_area: '480',
    status: 'published',
    images: [],
    owner: { name: 'Local Property Owner' },
  },
  {
    id: 712,
    title: 'Downtown Office Suite',
    property_type: 'Office Spaces',
    listing_type: 'rent',
    description: 'Flexible commercial office suite in Butuan City.',
    price: '38000',
    address_line: 'J.C. Aquino Avenue, Butuan City',
    barangay: 'Holy Redeemer Pob.',
    city: 'Butuan City',
    province: 'Agusan del Norte',
    floor_area: '120',
    status: 'published',
    images: [],
    owner: { name: 'Local Property Owner' },
  },
]

test('homepage shows live property and submits selected search filters', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/properties**', (route) =>
    route.fulfill({ json: { data: properties, meta: { total: properties.length } } }),
  )

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Make room for what your business does next.' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Butuan Logistics Warehouse/ })).toBeVisible()
  await expect(page.getByText('2 published properties')).toBeVisible()

  await page.getByRole('button', { name: 'For Sale', exact: true }).click()
  await page.getByLabel('Property type').selectOption('Warehouses')
  await page.getByLabel('Search property or location').fill('Bancasi')
  await page.getByRole('button', { name: 'Search', exact: true }).click()

  await expect(page).toHaveURL(/\/properties\?search=Bancasi&type=Warehouses&listing=For\+Sale/)
})

test('homepage provides a retry action when the listing API fails', async ({ page }) => {
  let requestCount = 0
  await page.route('http://127.0.0.1:8000/api/properties**', async (route) => {
    requestCount += 1
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'upstream failure details' }),
    })
  })

  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('We couldn’t load current listings.')
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable')
  await page.getByRole('button', { name: 'Retry' }).click()
  await expect.poll(() => requestCount).toBe(2)
})

test('homepage shows a clear empty-inventory state without inventing listings', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/properties**', (route) =>
    route.fulfill({ json: { data: [], meta: { total: 0 } } }),
  )

  await page.goto('/')
  await expect(page.getByText('New commercial listings are on the way.')).toBeVisible()
  await expect(page.getByRole('link', { name: /Explore search/ })).toBeVisible()
})
