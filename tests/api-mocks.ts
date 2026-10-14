import type { Page } from '@playwright/test'

const property = {
  id: 1,
  title: 'Playwright Commercial Office',
  property_type: 'Office Spaces',
  listing_type: 'rent',
  description: 'Available commercial office space in central Butuan.',
  price: '12000',
  currency: 'PHP',
  address_line: 'Central Butuan',
  barangay: 'Central',
  city: 'Butuan City',
  province: 'Agusan del Norte',
  floor_area: '65',
  status: 'published',
  images: [],
  owner: { name: 'Listing Owner' },
}

export async function mockPublicPropertyApi(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.split('/api/')[1]

    if (path === 'properties') {
      await route.fulfill({
        json: { data: [property], meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 } },
      })
      return
    }

    if (path === 'properties/1') {
      await route.fulfill({ json: { data: property } })
      return
    }

    if (path?.startsWith('properties/')) {
      const id = Number(path.split('/')[1])
      await route.fulfill({ json: { data: { ...property, id } } })
      return
    }

    await route.fulfill({ json: { data: [], meta: { total: 0 } } })
  })
}

export async function mockInvalidLogin(page: Page): Promise<void> {
  await page.route('**/api/login', async (route) => {
    await route.fulfill({
      status: 422,
      json: { message: 'The provided credentials are incorrect.' },
    })
  })
}
