import { expect, test } from '@playwright/test'

const buyer = {
  id: 81,
  name: 'Playwright Buyer',
  email: 'buyer@example.test',
  phone: '09171234567',
  role: 'buyer',
  account_status: 'active',
}

const property = {
  id: 71,
  title: 'Playwright Commercial Space',
  property_type: 'Office Spaces',
  listing_type: 'rent',
  description: 'Available commercial office space.',
  price: '12000',
  address_line: 'Central Butuan',
  barangay: 'Central',
  city: 'Butuan City',
  province: 'Agusan del Norte',
  floor_area: '65',
  status: 'published',
  images: [],
  owner: { name: 'Listing Owner' },
}

test('buyer login returns to storefront and account actions stay connected', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/', '')

    if (path === 'login') {
      await route.fulfill({ json: { token: 'playwright-token', user: buyer } })
    } else if (path === 'logout') {
      await route.fulfill({ json: { message: 'Logged out successfully.' } })
    } else if (path === 'user') {
      await route.fulfill({ json: { user: buyer } })
    } else if (path === 'properties') {
      await route.fulfill({ json: { data: [property], meta: { total: 1 } } })
    } else if (path === 'properties/71') {
      await route.fulfill({ json: { data: property } })
    } else {
      await route.fulfill({ json: { data: [], meta: { total: 0 } } })
    }
  })

  await page.goto('/login')
  await page.getByLabel('Email Address').fill(buyer.email)
  await page.locator('#login-password').fill('ValidPass123!')
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page).toHaveURL(/\/$/)
  const mainNavigation = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(mainNavigation.getByRole('link', { name: 'Properties', exact: true })).toBeVisible()
  await expect(mainNavigation.getByRole('link', { name: 'Categories', exact: true })).toBeVisible()
  await expect(mainNavigation.getByRole('link', { name: 'About', exact: true })).toHaveCount(0)
  const primaryLinks = await mainNavigation.locator('a').allTextContents()
  expect(primaryLinks.slice(0, 3).map((label) => label.trim())).toEqual(['Home', 'Categories', 'Properties'])
  await expect(page.getByRole('link', { name: 'Saved Properties' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'My Inquiries' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Become a Publisher' })).toBeVisible()

  await page.getByRole('link', { name: 'Saved Properties' }).click()
  await expect(page).toHaveURL(/\/buyer\/saved-properties$/)
  await expect(page.getByRole('heading', { name: 'Saved Properties', exact: true })).toBeVisible()
  await mainNavigation.getByRole('link', { name: 'Properties', exact: true }).click()
  await expect(page).toHaveURL(/\/properties$/)
  await expect(page.getByRole('heading', { name: 'Explore Commercial Properties' })).toBeVisible()

  await page.getByRole('link', { name: /Playwright Commercial Space/ }).click()
  await expect(page).toHaveURL(/\/properties\/71$/)
  await expect(page.getByRole('heading', { name: 'Playwright Commercial Space' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect.poll(() => page.evaluate(() => localStorage.getItem('butuanspaces_auth_token'))).toBeNull()
})

test('guest inquiry prompts sign in and returns to the property afterward', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace('/api/', '')
    if (path === 'properties/71') {
      await route.fulfill({ json: { data: property } })
    } else {
      await route.fulfill({ json: { data: [], meta: { total: 0 } } })
    }
  })

  await page.goto('/properties/71')
  await expect(page.getByRole('heading', { name: 'Sign in to inquire' })).toBeVisible()
  await page.getByRole('link', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?redirect=\/?properties\/71/)
})

test('refreshing home restores the previous scroll position', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/**', (route) =>
    route.fulfill({ json: { data: [], meta: { total: 0 } } }),
  )

  await page.goto('/#categories')
  await page.evaluate(() => {
    window.scrollTo(0, 620)
    window.dispatchEvent(new Event('scroll'))
  })
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
  await expect.poll(() => page.evaluate(() => {
    const saved = sessionStorage.getItem('butuanspaces_scroll:/#categories')
    return saved ? JSON.parse(saved).top : 0
  })).toBeGreaterThan(500)

  await page.reload()
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500)
})

test('refreshing a text form restores its non-sensitive draft fields', async ({ page }) => {
  await page.route('http://127.0.0.1:8000/api/**', (route) =>
    route.fulfill({ json: { data: [], meta: { total: 0 } } }),
  )

  await page.goto('/report-issue')
  await page.locator('#issue-title').fill('Map control does not respond')
  await page.locator('#issue-description').fill('The map control stays blank after I select a property.')
  await page.reload()

  await expect(page.locator('#issue-title')).toHaveValue('Map control does not respond')
  await expect(page.locator('#issue-description')).toHaveValue('The map control stays blank after I select a property.')
})
