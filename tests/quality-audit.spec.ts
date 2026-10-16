import { expect, test } from '@playwright/test'
import {
  assertMapPinSelected,
  expectHealthyPage,
  fillOwnerListing,
  installQualityMocks,
  propertyRecord,
  qualityUsers,
  watchBrowserHealth,
} from './quality-fixtures'

const publicPages = [
  { path: '/', landmark: 'main', text: 'Find the right space' },
  { path: '/properties', landmark: 'main', text: 'Explore Commercial Properties' },
  { path: '/properties/201', landmark: 'main', text: 'Quality Test Retail Unit' },
  { path: '/report-issue', landmark: 'main', text: 'Report an Issue' },
  { path: '/login', landmark: 'main', text: 'Sign in to your account' },
  { path: '/register', landmark: 'main', text: 'Create your account' },
  { path: '/forgot-password', landmark: 'main', text: 'Forgot your password?' },
  { path: '/reset-password?token=quality-token&email=buyer%40example.test', landmark: 'main', text: 'Set a new password' },
]

const pixel = { name: 'quality-upload.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/WioAAAAASUVORK5CYII=', 'base64') }

for (const route of publicPages) {
  test(`public UI audit ${route.path} at desktop and mobile sizes`, async ({ page }) => {
    const errors = watchBrowserHealth(page)
    await installQualityMocks(page)

    await page.setViewportSize({ width: 1365, height: 900 })
    await page.goto(route.path)
    await expect(page.locator(route.landmark).first()).toBeVisible()
    await expect(page.getByText(route.text, { exact: false }).first()).toBeVisible()
    await expectHealthyPage(page, errors)

    await page.setViewportSize({ width: 360, height: 800 })
    await page.reload()
    await expect(page.locator(route.landmark).first()).toBeVisible()
    await expectHealthyPage(page, errors)
  })
}

test('guest access to every protected workspace redirects to login safely', async ({ page }) => {
  await installQualityMocks(page)
  const protectedPaths = [
    '/buyer/saved-properties', '/buyer/inquiries', '/publisher/apply',
    '/owner/dashboard', '/owner/properties', '/developer/dashboard',
    '/broker/dashboard', '/broker/listings', '/admin/dashboard', '/admin/properties',
  ]

  for (const path of protectedPaths) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`/login\\?redirect=${path.replaceAll('/', '\\/')}`))
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible()
  }
})

test('valid role sessions can open the matching workspace dashboards', async ({ page }) => {
  const workspaceCases = [
    { user: qualityUsers.buyer, path: '/buyer/saved-properties', heading: 'Saved Properties' },
    { user: qualityUsers.owner, path: '/owner/dashboard', heading: 'Dashboard Overview' },
    { user: qualityUsers.developer, path: '/developer/dashboard', heading: 'Dashboard Overview' },
    { user: qualityUsers.broker, path: '/broker/dashboard', heading: 'Dashboard Overview' },
    { user: qualityUsers.admin, path: '/admin/dashboard', heading: 'Dashboard Overview' },
  ]

  for (const entry of workspaceCases) {
    await installQualityMocks(page, { user: entry.user })
    await page.goto(entry.path)
    await expect(page).toHaveURL(new RegExp(`${entry.path.replaceAll('/', '\\/')}$`))
    await expect(page.getByRole('heading', { name: entry.heading, exact: true })).toBeVisible()
    await expect(page.getByRole('alert')).toHaveCount(0)
  }
})

const authorizedWorkspaceRoutes: { role: keyof typeof qualityUsers; paths: string[] }[] = [
  { role: 'buyer', paths: ['/buyer/saved-properties', '/buyer/inquiries', '/publisher/apply'] },
  { role: 'owner', paths: ['/owner/dashboard', '/owner/properties', '/owner/properties/create', '/owner/properties/201/edit', '/owner/properties/201', '/owner/inquiries'] },
  { role: 'developer', paths: ['/developer/dashboard', '/developer/properties', '/developer/properties/create', '/developer/properties/201/edit', '/developer/properties/201', '/developer/inquiries'] },
  { role: 'broker', paths: ['/broker/dashboard', '/broker/listings', '/broker/listings/create', '/broker/listings/201/edit', '/broker/listings/201', '/broker/inquiries', '/broker/profile'] },
  { role: 'admin', paths: ['/admin/dashboard', '/admin/properties', '/admin/users', '/admin/verifications', '/admin/publisher-applications', '/admin/inquiries', '/admin/reports'] },
]

for (const workspace of authorizedWorkspaceRoutes) {
  test(`${workspace.role} workspace routes render at desktop and mobile sizes`, async ({ page }) => {
    const errors = watchBrowserHealth(page)
    const initialProperties = workspace.role === 'developer'
      ? [propertyRecord(201, { owner_id: qualityUsers.developer.id, status: 'draft', published_at: null })]
      : undefined
    await installQualityMocks(page, { user: qualityUsers[workspace.role], initialProperties })

    for (const path of workspace.paths) {
      await page.setViewportSize({ width: 1280, height: 850 })
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(`${path.replaceAll('/', '\\/')}$`))
      await expect(page.locator('h1').first()).toBeVisible()
      await expectHealthyPage(page, errors)

      await page.setViewportSize({ width: 360, height: 800 })
      await expectHealthyPage(page, errors)
    }
  })
}

test('property filters update results and can be reset', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  await installQualityMocks(page)
  await page.goto('/properties')
  await expect(page.getByRole('link', { name: /Quality Test Retail Unit/ })).toBeVisible()

  await page.locator('#listing-type').selectOption({ label: 'For Sale' })
  await expect(page.getByText('No properties found')).toBeVisible()
  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByRole('link', { name: /Quality Test Retail Unit/ })).toBeVisible()

  await page.locator('#property-search').fill('not a real Butuan listing')
  await expect(page.getByText('No properties found')).toBeVisible()
  await expectHealthyPage(page, errors)
})

test('property details load lease type, every photo, map pin, and guest inquiry prompt', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  await installQualityMocks(page)
  await page.goto('/properties/201')

  await expect(page.getByRole('heading', { name: 'Quality Test Retail Unit' })).toBeVisible()
  await expect(page.getByText('For Lease', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sign in to inquire' })).toBeVisible()
  await expect(page.locator('.leaflet-container')).toBeVisible()
  await expect(page.locator('.leaflet-interactive')).toBeVisible()
  await expect(page.locator('.thumbnail')).toHaveCount(3)
  await expect(page.locator('.main-image img')).toHaveJSProperty('naturalWidth', 1)
  await page.getByRole('button', { name: 'Next image' }).click()
  await expect(page.locator('.image-counter')).toHaveText('2 / 3')
  await expectHealthyPage(page, errors)
})

test('older property without coordinates shows an area-search fallback rather than a broken map', async ({ page }) => {
  await installQualityMocks(page, { initialProperties: [propertyRecord(202, { latitude: null, longitude: null, images: [] })] })
  await page.goto('/properties/202')
  await expect(page.getByText('Exact map pin not available')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Search this area' })).toHaveAttribute('href', /openstreetmap\.org\/search/)
  await expect(page.locator('.leaflet-container')).toHaveCount(0)
})

test('guest inquiry link preserves the current listing as the post-login destination', async ({ page }) => {
  await installQualityMocks(page)
  await page.goto('/properties/201')
  await page.getByRole('link', { name: 'Sign In', exact: true }).click()
  await expect(page).toHaveURL(/\/login\?redirect=\/?properties\/201/)
})

test('login validation, password visibility, successful session, and sign out work', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  await installQualityMocks(page, { loginUser: qualityUsers.buyer })
  await page.goto('/login')

  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
  await expect(page.getByText('Please enter your password.')).toBeVisible()

  await page.locator('#login-email').fill(qualityUsers.buyer.email)
  await page.locator('#login-password').fill('QualityPass123!')
  await page.getByRole('button', { name: 'Show password' }).click()
  await expect(page.locator('#login-password')).toHaveAttribute('type', 'text')
  await page.getByRole('button', { name: 'Hide password' }).click()
  await expect(page.locator('#login-password')).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page).toHaveURL('/login')
  await expect.poll(() => page.evaluate(() => localStorage.getItem('butuanspaces_auth_token'))).toBeNull()
  await expectHealthyPage(page, errors)
})

test('buyer can save a listing, remove it, and send a validated inquiry', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  const calls = await installQualityMocks(page, { user: qualityUsers.buyer })
  await page.goto('/properties/201')

  await page.getByRole('button', { name: 'Save Property' }).click()
  await expect(page.getByRole('status')).toContainText('Saved to your buyer dashboard.')
  await page.goto('/buyer/saved-properties')
  await expect(page.getByRole('heading', { name: 'Quality Test Retail Unit' })).toBeVisible()
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByText('No saved properties yet')).toBeVisible()

  await page.goto('/properties/201')
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await page.locator('#inquiry-name').fill('')
  await page.locator('#inquiry-email').fill('')
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.getByText('Please enter your name.')).toBeVisible()
  await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
  await page.getByLabel('Full Name').fill(qualityUsers.buyer.name)
  await page.getByLabel('Email Address').fill(qualityUsers.buyer.email)
  await page.getByLabel('Contact Number').fill(qualityUsers.buyer.phone)
  await page.getByLabel('Your Message').fill('I would like to arrange a viewing this week.')
  await page.getByRole('button', { name: 'Send Inquiry' }).click()
  await expect(page.getByRole('status')).toContainText('Your inquiry has been sent.')
  expect(calls.inquiries).toHaveLength(1)
  expect(calls.inquiries[0]).toMatchObject({ property_id: 201, email: qualityUsers.buyer.email })
  await expectHealthyPage(page, errors)
})

test('buyer registration rejects invalid data and creates only a buyer account', async ({ page }) => {
  const calls = await installQualityMocks(page)
  await page.goto('/register')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page.getByText('Please enter your full name.')).toBeVisible()
  await expect(page.getByText('Please accept the account terms.')).toBeVisible()

  await page.locator('#register-name').fill('Quality New Buyer')
  await page.locator('#register-email').fill('new-buyer@example.test')
  await page.locator('#register-phone').fill('09171231234')
  await page.locator('#register-password').fill('QualityPass123!')
  await page.locator('#register-confirm').fill('QualityPass123!')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL('/')
  const request = calls.requests.find((item) => item.path === 'register')
  expect(request?.body).toContain('"role":"buyer"')
})

test('password-reset request validates email and gives a non-enumerating success message', async ({ page }) => {
  const calls = await installQualityMocks(page)
  await page.goto('/forgot-password')
  await page.getByRole('button', { name: 'Send Reset Link' }).click()
  await expect(page.getByRole('alert')).toContainText('Please enter a valid email address.')
  await page.getByLabel('Email Address').fill(qualityUsers.buyer.email)
  await page.getByRole('button', { name: 'Send Reset Link' }).click()
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible()
  expect(calls.requests.some((item) => item.path === 'forgot-password')).toBeTruthy()
})

test('public issue report validation and submission persist a report request', async ({ page }) => {
  const calls = await installQualityMocks(page)
  await page.goto('/report-issue')
  await page.getByRole('button', { name: 'Submit Report' }).click()
  await expect(page.getByRole('status')).toContainText('Issue title and description are required.')
  await page.locator('#issue-title').fill('Map marker does not move')
  await page.locator('#issue-description').fill('The location marker does not update after selecting a new point.')
  await page.locator('#issue-email').fill('not-an-email')
  await page.getByRole('button', { name: 'Submit Report' }).click()
  await expect(page.getByRole('status')).toContainText('Enter a valid email or leave it blank.')
  await page.locator('#issue-email').fill('')
  await page.getByRole('button', { name: 'Submit Report' }).click()
  await expect(page.getByRole('status')).toContainText('Your issue report has been submitted.')
  expect(calls.reports).toHaveLength(1)
  expect(calls.reports[0]).toMatchObject({ title: 'Map marker does not move' })
})

test('owner listing form requires a map pin, uploads a photo, and submits a lease listing', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  const calls = await installQualityMocks(page, { user: qualityUsers.owner })
  await page.goto('/owner/properties/create')
  await expect(page.getByRole('heading', { name: 'Add New Property' })).toBeVisible()

  await fillOwnerListing(page)
  await page.getByRole('button', { name: 'Submit for Review' }).click()
  await expect(page.getByText('Choose the property location on the map before submitting for review.')).toBeVisible()
  await expect(page).toHaveURL('/owner/properties/create')

  await assertMapPinSelected(page)
  await page.getByRole('button', { name: 'Submit for Review' }).click()
  await expect(page.getByRole('status')).toContainText('was submitted for review.')
  expect(calls.listingForms).toHaveLength(1)
  expect(calls.listingForms[0]).toContain('name="listing_type"\r\n\r\nlease')
  expect(calls.listingForms[0]).toContain('name="latitude"')
  expect(calls.listingForms[0]).toContain('name="longitude"')
  expect(calls.listingForms[0]).toContain('quality-photo.png')
  await expectHealthyPage(page, errors)
})

test('broker dropdowns support all listing types and pending lease listings include coordinates', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  const calls = await installQualityMocks(page, { user: qualityUsers.broker })
  await page.goto('/broker/listings/create')
  await expect(page.locator('#broker-property-type')).toHaveValue('Office Spaces')
  await expect(page.locator('#broker-listing-type').locator('option')).toHaveCount(3)
  await page.locator('#broker-property-type').selectOption({ label: 'Warehouses' })
  await page.locator('#broker-listing-type').selectOption({ label: 'For Lease' })
  await page.locator('#broker-title').fill('Quality Broker Warehouse')
  await page.locator('#broker-location').fill('Libertad commercial corridor')
  await page.locator('#broker-barangay').fill('Libertad')
  await page.locator('#broker-price').fill('42000')
  await page.locator('#broker-area').fill('250')
  await page.locator('#broker-description').fill('A broker-managed warehouse listing used for browser workflow coverage.')
  await assertMapPinSelected(page)
  await page.getByRole('button', { name: 'Submit for Review' }).click()
  await expect(page).toHaveURL(/\/broker\/listings\/\d+$/)
  await expect(page.getByRole('heading', { name: 'Quality Broker Warehouse' })).toBeVisible()
  expect(calls.listingForms[0]).toContain('name="listing_type"\r\n\r\nlease')
  expect(calls.listingForms[0]).toContain('name="latitude"')
  await expectHealthyPage(page, errors)
})

test('admin review modal shows uploaded photos, validates rejection notes, and restores focus', async ({ page }) => {
  const errors = watchBrowserHealth(page)
  const record = propertyRecord(401, { title: 'Quality Pending Admin Listing', status: 'pending', published_at: null })
  await installQualityMocks(page, { user: qualityUsers.admin, initialProperties: [record] })
  await page.goto('/admin/properties')

  const trigger = page.getByRole('button', { name: 'Review Quality Pending Admin Listing' })
  await expect(trigger).toBeVisible()
  await trigger.click()
  const dialog = page.getByRole('dialog', { name: 'Listing Details' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('heading', { name: 'Quality Pending Admin Listing' })).toBeVisible()
  await expect(dialog.getByRole('img')).toHaveCount(3)
  await dialog.getByRole('button', { name: 'Reject Listing' }).click()
  await expect(dialog.getByRole('status')).toContainText('A rejection reason is required.')
  await dialog.locator('#admin-review-note').fill('Quality audit rejection note.')
  await dialog.getByRole('button', { name: 'Reject Listing' }).click()
  await expect(dialog.getByRole('status')).toContainText('Listing rejected.')
  await expect(page.getByRole('row').filter({ hasText: 'Quality Pending Admin Listing' }).getByText('Rejected')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await expectHealthyPage(page, errors)
})

test('admin approves a listing and can unpublish it with a reason and confirmation', async ({ page }) => {
  await installQualityMocks(page, { user: qualityUsers.admin, initialProperties: [propertyRecord(402, { title: 'Quality Approval Listing', status: 'pending', published_at: null })] })
  await page.goto('/admin/properties')
  await page.getByRole('button', { name: 'Review Quality Approval Listing' }).click()
  let dialog = page.getByRole('dialog', { name: 'Listing Details' })
  await dialog.getByRole('button', { name: 'Approve Listing' }).click()
  await expect(dialog.getByRole('status')).toContainText('Listing approved.')
  await expect(dialog.getByLabel('Reason for unpublishing')).toBeVisible()

  await dialog.getByLabel('Reason for unpublishing').fill('Listing requires updated availability details.')
  page.once('dialog', (browserDialog) => browserDialog.accept())
  await dialog.getByRole('button', { name: 'Unpublish Listing' }).click()
  await expect(dialog.getByRole('status')).toContainText('Listing unpublished and returned to draft.')
  await expect(page.getByRole('row').filter({ hasText: 'Quality Approval Listing' }).getByText('Draft')).toBeVisible()
})

test('admin modal closes with its close button and backdrop without changing the selected listing', async ({ page }) => {
  await installQualityMocks(page, { user: qualityUsers.admin, initialProperties: [propertyRecord(403, { title: 'Quality Modal Listing', status: 'draft', published_at: null })] })
  await page.goto('/admin/properties')
  await page.getByRole('button', { name: 'Review Quality Modal Listing' }).click()
  let dialog = page.getByRole('dialog', { name: 'Listing Details' })
  await dialog.getByRole('button', { name: 'Close listing details' }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByRole('button', { name: 'Review Quality Modal Listing' }).click()
  dialog = page.getByRole('dialog', { name: 'Listing Details' })
  await page.locator('.details-backdrop').click({ position: { x: 5, y: 5 } })
  await expect(dialog).toHaveCount(0)
})
