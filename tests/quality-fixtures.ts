import { expect, type Page, type Request, type Route } from '@playwright/test'

export type QualityRole = 'buyer' | 'owner' | 'developer' | 'broker' | 'admin'

export interface QualityUser {
  id: number
  name: string
  email: string
  phone: string
  role: QualityRole
  account_status: 'active' | 'suspended'
}

export const qualityUsers: Record<QualityRole, QualityUser> = {
  buyer: { id: 11, name: 'Quality Buyer', email: 'buyer@example.test', phone: '09171234567', role: 'buyer', account_status: 'active' },
  owner: { id: 12, name: 'Quality Owner', email: 'owner@example.test', phone: '09171234568', role: 'owner', account_status: 'active' },
  developer: { id: 13, name: 'Quality Developer', email: 'developer@example.test', phone: '09171234569', role: 'developer', account_status: 'active' },
  broker: { id: 14, name: 'Quality Broker', email: 'broker@example.test', phone: '09171234560', role: 'broker', account_status: 'active' },
  admin: { id: 15, name: 'Quality Admin', email: 'admin@example.test', phone: '09171234561', role: 'admin', account_status: 'active' },
}

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/WioAAAAASUVORK5CYII=', 'base64')

export function propertyRecord(id = 201, overrides: Record<string, unknown> = {}) {
  return {
    id,
    owner_id: qualityUsers.owner.id,
    broker_id: null,
    title: 'Quality Test Retail Unit',
    property_type: 'Retail Spaces',
    listing_type: 'lease',
    description: 'A test commercial listing in Butuan City with enough details for inquiry workflows.',
    price: '25000.00',
    currency: 'PHP',
    address_line: 'J.C. Aquino Avenue',
    barangay: 'Ampayon',
    city: 'Butuan City',
    province: 'Agusan del Norte',
    latitude: '8.9475000',
    longitude: '125.5406000',
    floor_area: '85.00',
    lot_area: null,
    parking_spaces: 2,
    status: 'published',
    published_at: '2026-10-16T00:00:00.000000Z',
    created_at: '2026-10-15T00:00:00.000000Z',
    updated_at: '2026-10-16T00:00:00.000000Z',
    review_notes: null,
    images: [1, 2, 3].map((index) => ({
      id: id * 10 + index,
      property_id: id,
      path: `https://media.quality.test/photo-${index}.png`,
      alt_text: `Quality property photo ${index}`,
      sort_order: index - 1,
      is_primary: index === 1,
    })),
    owner: { id: qualityUsers.owner.id, name: qualityUsers.owner.name, email: qualityUsers.owner.email },
    broker: null,
    ...overrides,
  }
}

export interface QualityMockOptions {
  user?: QualityUser | null
  loginUser?: QualityUser
  initialProperties?: Record<string, unknown>[]
}

export interface QualityCalls {
  requests: { method: string; path: string; body: string | null }[]
  inquiries: Record<string, unknown>[]
  reports: Record<string, unknown>[]
  listingForms: string[]
}

function formField(body: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return body.match(new RegExp(`name="${escaped}"\\r\\n\\r\\n([^\\r]*)`))?.[1]
}

async function fulfillJson(route: Route, json: unknown, status = 200): Promise<void> {
  await route.fulfill({ status, contentType: 'application/json', json })
}

export async function installQualityMocks(page: Page, options: QualityMockOptions = {}): Promise<QualityCalls> {
  let sessionUser = options.user ?? null
  const loginUser = options.loginUser ?? qualityUsers.buyer
  let properties = (options.initialProperties ?? [propertyRecord()]).map((item) => ({ ...item }))
  let savedProperties: Record<string, unknown>[] = []
  const inquiries: Record<string, unknown>[] = []
  const reports: Record<string, unknown>[] = []
  const listingForms: string[] = []
  const calls: QualityCalls = { requests: [], inquiries, reports, listingForms }

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.split('/api/')[1]?.replace(/^\/+/, '') ?? ''
    const method = request.method().toUpperCase()
    const body = request.postData()
    calls.requests.push({ method, path, body })

    if (path === 'login' && method === 'POST') {
      sessionUser = loginUser
      await fulfillJson(route, { token: 'quality-test-token', user: loginUser })
      return
    }
    if (path === 'register' && method === 'POST') {
      sessionUser = qualityUsers.buyer
      await fulfillJson(route, { token: 'quality-test-token', user: sessionUser }, 201)
      return
    }
    if (path === 'forgot-password' && method === 'POST') {
      await fulfillJson(route, { message: 'If an account exists, a reset link has been sent.' })
      return
    }
    if (path === 'reset-password' && method === 'POST') {
      await fulfillJson(route, { message: 'Your password has been reset.' })
      return
    }
    if (path === 'user' && method === 'GET') {
      if (sessionUser) await fulfillJson(route, { user: sessionUser })
      else await fulfillJson(route, { message: 'Unauthenticated.' }, 401)
      return
    }
    if (path === 'logout' && method === 'POST') {
      await fulfillJson(route, { message: 'Logged out successfully.' })
      return
    }
    if (path === 'properties' && method === 'GET') {
      const search = (url.searchParams.get('search') ?? '').toLowerCase()
      const type = url.searchParams.get('property_type')
      const listingType = url.searchParams.get('listing_type')
      const filtered = properties.filter((property) => {
        const record = property as Record<string, unknown>
        const listing = String(record.listing_type ?? '').toLowerCase()
        return (!search || `${record.title} ${record.address_line} ${record.barangay}`.toLowerCase().includes(search))
          && (!type || record.property_type === type)
          && (!listingType || listing === listingType)
          && record.status === 'published'
      })
      await fulfillJson(route, { data: filtered, meta: { current_page: 1, last_page: 1, per_page: 50, total: filtered.length } })
      return
    }
    if (/^properties\/\d+\/inquiries$/.test(path) && method === 'POST') {
      inquiries.push({ ...(body ? JSON.parse(body) as Record<string, unknown> : {}), property_id: Number(path.split('/')[1]) })
      await fulfillJson(route, { message: 'Inquiry received.', data: { id: 501 } }, 201)
      return
    }
    if (/^properties\/\d+\/reports$/.test(path) && method === 'POST') {
      reports.push(body ? JSON.parse(body) as Record<string, unknown> : {})
      await fulfillJson(route, { message: 'Report received.', data: { id: 601 } }, 201)
      return
    }
    if (/^properties\/\d+$/.test(path) && method === 'GET') {
      const id = Number(path.split('/')[1])
      const found = properties.find((property) => Number((property as Record<string, unknown>).id) === id)
      if (found) await fulfillJson(route, { data: found })
      else await fulfillJson(route, { message: 'Not found.' }, 404)
      return
    }
    if (path === 'reports' && method === 'POST') {
      reports.push(body ? JSON.parse(body) as Record<string, unknown> : {})
      await fulfillJson(route, { message: 'Report received.', data: { id: 601 } }, 201)
      return
    }
    if (path === 'my/saved-properties' && method === 'GET') {
      await fulfillJson(route, { data: savedProperties })
      return
    }
    if (/^my\/saved-properties\/\d+$/.test(path) && method === 'POST') {
      const id = Number(path.split('/').at(-1))
      const property = properties.find((item) => Number((item as Record<string, unknown>).id) === id)
      if (property && !savedProperties.some((item) => Number((item as Record<string, unknown>).id) === id)) savedProperties.push(property)
      await fulfillJson(route, { message: 'Property saved.' }, 201)
      return
    }
    if (/^my\/saved-properties\/\d+$/.test(path) && method === 'DELETE') {
      const id = Number(path.split('/').at(-1))
      savedProperties = savedProperties.filter((item) => Number((item as Record<string, unknown>).id) !== id)
      await fulfillJson(route, { message: 'Property removed.' })
      return
    }
    if (path === 'my/inquiries' || path === 'my/inquiries/sent') {
      await fulfillJson(route, { data: inquiries.map((item, index) => ({ id: 501 + index, status: 'new', created_at: '2026-10-16T00:00:00Z', property: properties[0], ...item })) })
      return
    }
    if (/^inquiries\/\d+$/.test(path) && method === 'PATCH') {
      await fulfillJson(route, { message: 'Inquiry updated.' })
      return
    }
    if (path === 'my/properties' && method === 'GET') {
      const publisherItems = properties.filter((item) => {
        const record = item as Record<string, unknown>
        return record.status !== 'published' || Number(record.owner_id) === sessionUser?.id || Number(record.broker_id) === sessionUser?.id
      })
      await fulfillJson(route, { data: publisherItems, meta: { total: publisherItems.length } })
      return
    }
    if (path === 'my/properties' && method === 'POST') {
      const content = body ?? ''
      listingForms.push(content)
      const id = 701 + listingForms.length
      const status = formField(content, 'submit_for_review') === '1' ? 'pending' : 'draft'
      const listing = propertyRecord(id, {
        owner_id: sessionUser?.id ?? qualityUsers.owner.id,
        broker_id: sessionUser?.role === 'broker' ? sessionUser.id : null,
        title: formField(content, 'title') ?? 'Saved quality listing',
        property_type: formField(content, 'property_type') ?? 'Office Spaces',
        listing_type: formField(content, 'listing_type') ?? 'rent',
        address_line: formField(content, 'address_line') ?? 'Butuan City',
        barangay: formField(content, 'barangay') ?? 'Ampayon',
        latitude: formField(content, 'latitude') ?? null,
        longitude: formField(content, 'longitude') ?? null,
        price: formField(content, 'price') ?? '25000',
        floor_area: formField(content, 'floor_area') ?? '85',
        description: formField(content, 'description') ?? 'Quality listing description.',
        status,
        published_at: null,
        created_at: '2026-10-16T00:00:00.000000Z',
      })
      properties.unshift(listing)
      await fulfillJson(route, { message: 'Property saved.', data: listing }, 201)
      return
    }
    if (/^my\/properties\/\d+$/.test(path) && method === 'POST') {
      listingForms.push(body ?? '')
      const current = properties.find((item) => Number((item as Record<string, unknown>).id) === Number(path.split('/').at(-1)))
      await fulfillJson(route, { message: 'Property updated.', data: current ?? propertyRecord(Number(path.split('/').at(-1))) })
      return
    }
    if (/^my\/properties\/\d+$/.test(path) && method === 'DELETE') {
      await fulfillJson(route, { message: 'Listing deleted.' })
      return
    }
    if (path === 'my/publisher-application' && method === 'GET') {
      await fulfillJson(route, { data: null })
      return
    }
    if (path === 'my/publisher-application' && method === 'POST') {
      await fulfillJson(route, { message: 'Publisher application received.', data: { id: 801, status: 'pending' } }, 201)
      return
    }
    if (path === 'broker/verification' && method === 'GET') {
      await fulfillJson(route, { data: null })
      return
    }
    if (path === 'broker/verification' && method === 'POST') {
      await fulfillJson(route, { message: 'Verification request received.', data: { id: 901, status: 'pending' } }, 201)
      return
    }
    if (path === 'admin/dashboard' && method === 'GET') {
      await fulfillJson(route, { data: { total_properties: properties.length, pending_properties: properties.filter((item) => (item as Record<string, unknown>).status === 'pending').length, open_inquiries: inquiries.length, open_reports: reports.length, pending_verifications: 0 } })
      return
    }
    if (path === 'admin/properties' && method === 'GET') {
      await fulfillJson(route, { data: properties })
      return
    }
    if (/^admin\/properties\/\d+(\/unpublish)?$/.test(path) && method === 'PATCH') {
      const id = Number(path.split('/')[2])
      const index = properties.findIndex((item) => Number((item as Record<string, unknown>).id) === id)
      if (index >= 0) {
        const payload = body ? JSON.parse(body) as Record<string, unknown> : {}
        const nextStatus = path.endsWith('/unpublish') ? 'draft' : payload.status
        properties[index] = { ...(properties[index] as Record<string, unknown>), status: nextStatus, review_notes: payload.review_notes ?? null }
        await fulfillJson(route, { data: properties[index] })
      } else await fulfillJson(route, { message: 'Not found.' }, 404)
      return
    }
    if (path === 'admin/verifications' && method === 'GET') { await fulfillJson(route, { data: [] }); return }
    if (path === 'admin/users' && method === 'GET') { await fulfillJson(route, { data: [] }); return }
    if (path === 'admin/inquiries' && method === 'GET') { await fulfillJson(route, { data: [] }); return }
    if (path === 'admin/reports' && method === 'GET') { await fulfillJson(route, { data: [] }); return }
    if (path === 'admin/publisher-applications' && method === 'GET') { await fulfillJson(route, { data: [] }); return }
    if (/^admin\/(users|verifications|publisher-applications|reports|inquiries)\//.test(path) && (method === 'PATCH' || method === 'PUT')) {
      await fulfillJson(route, { message: 'Updated.' })
      return
    }

    await fulfillJson(route, { data: [], meta: { total: 0 } })
  })

  await page.route('https://media.quality.test/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: png })
  })
  await page.route(/https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/, async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: png })
  })

  if (sessionUser) {
    await page.addInitScript((account) => {
      localStorage.setItem('butuanspaces_auth_token', 'quality-test-token')
      localStorage.setItem('butuanspaces_auth_user', JSON.stringify(account))
    }, sessionUser)
  }

  return calls
}

export function watchBrowserHealth(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`Page error: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`Console error: ${message.text()}`)
  })
  page.on('requestfailed', (request: Request) => {
    if (new URL(request.url()).host.startsWith('127.0.0.1') || new URL(request.url()).host.startsWith('localhost')) {
      errors.push(`Request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400 && ['127.0.0.1', 'localhost'].includes(new URL(response.url()).hostname)) {
      errors.push(`HTTP ${response.status()}: ${response.url()}`)
    }
  })
  return errors
}

export async function expectHealthyPage(page: Page, errors: string[]): Promise<void> {
  await expect(page.locator('body')).toBeVisible()
  const brokenImages = await page.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => {
      const element = image as HTMLImageElement
      if (element.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        element.addEventListener('load', () => resolve(), { once: true })
        element.addEventListener('error', () => resolve(), { once: true })
        setTimeout(resolve, 5000)
      })
    }))
    return images.filter((image) => (image as HTMLImageElement).naturalWidth === 0).map((image) => (image as HTMLImageElement).src)
  })
  for (const source of brokenImages) errors.push(`Broken image: ${source}`)

  const overflow = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    offenders: Array.from(document.querySelectorAll('body *'))
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        className: typeof element.className === 'string' ? element.className : '',
        text: element.textContent?.trim().slice(0, 35) ?? '',
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      }))
      .filter((element) => element.right > window.innerWidth + 2 || element.left < -2)
      .slice(0, 8),
  }))
  if (overflow.documentWidth > overflow.viewportWidth + 2) {
    errors.push(`Horizontal overflow ${overflow.documentWidth}px document / ${overflow.viewportWidth}px viewport: ${JSON.stringify(overflow.offenders)}`)
  }

  const unnamedButtons = await page.locator('button').evaluateAll((buttons) => buttons
    .filter((button) => !((button.getAttribute('aria-label') ?? '').trim() || (button.textContent ?? '').trim()))
    .map((button) => button.outerHTML.slice(0, 120)))
  for (const button of unnamedButtons) errors.push(`Button has no accessible name: ${button}`)

  expect(errors, 'Browser, image, network, accessibility-name, and layout health checks').toEqual([])
}

export async function fillOwnerListing(page: Page, title = 'Quality Owner Listing'): Promise<void> {
  await page.locator('#property-title').fill(title)
  await page.locator('#property-type').click()
  await page.getByRole('option', { name: 'Retail Spaces', exact: true }).click()
  await page.locator('#listing-type').click()
  await page.getByRole('option', { name: 'For Lease', exact: true }).click()
  await page.locator('#property-barangay').fill('Ampayon')
  await page.locator('#property-location').fill('J.C. Aquino Avenue')
  await page.locator('#property-price').fill('25000')
  await page.locator('#property-area').fill('85')
  await page.locator('#property-description').fill('A well-maintained retail property for lease in central Butuan City.')
  await page.locator('#property-images').setInputFiles({ name: 'quality-photo.png', mimeType: 'image/png', buffer: png })
}

export async function assertMapPinSelected(page: Page): Promise<void> {
  const map = page.locator('.location-map').first()
  await expect(map).toBeVisible()
  await map.click({ position: { x: 120, y: 120 } })
  await expect(map.locator('.leaflet-interactive')).toBeVisible()
}
