import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildPropertySearchParams, fetchPublicProperties, generateListingDescription, mapProperty } from './propertyService'

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

const backendProperty = {
  id: 7,
  title: 'Riverside Warehouse',
  property_type: 'warehouse',
  listing_type: 'rent',
  description: 'Near the port.',
  price: '45000.00',
  address_line: 'J.C. Aquino Ave',
  barangay: 'Libertad',
  city: 'Butuan City',
  province: 'Agusan del Norte',
  floor_area: '850',
  latitude: 8.9475,
  longitude: 125.5406,
  ai_tags: ['near port'],
  broker_id: null,
  owner: { id: 1, name: 'Ana Owner' },
  publisher: {
    id: 1, name: 'Ana Owner', role: 'owner', role_label: 'Property owner', verified: true,
    license_number: null, agency_name: null, member_since: '2026-10-01',
    contact: { phone: '09171234567', email: null, messenger_url: null, viber_url: null },
  },
  images: [
    { path: 'storage/properties/second.jpg', sort_order: 1, is_primary: false },
    { path: 'https://cdn.example.test/primary.jpg', sort_order: 0, is_primary: true },
  ],
}

describe('buildPropertySearchParams', () => {
  it('only sends filters that are set', () => {
    expect(buildPropertySearchParams().toString()).toBe('per_page=50')
  })

  it('maps UI filters to API parameters', () => {
    const params = buildPropertySearchParams({
      search: '  office ',
      listingType: 'For Lease',
      minPrice: 1000,
      maxPrice: 0,
      sort: 'price_desc',
      page: 2,
      perPage: 12,
      aiTags: ['flood-free'],
      barangay: 'Libertad',
      publisherId: 5,
    })

    expect(params.get('search')).toBe('office')
    expect(params.get('listing_type')).toBe('lease')
    expect(params.get('min_price')).toBe('1000')
    expect(params.get('max_price')).toBe('0')
    expect(params.get('sort')).toBe('price_desc')
    expect(params.get('page')).toBe('2')
    expect(params.get('per_page')).toBe('12')
    expect(params.getAll('ai_tags[]')).toEqual(['flood-free'])
    expect(params.get('barangay')).toBe('Libertad')
    expect(params.get('publisher')).toBe('5')
  })

  it('leaves out the default sort and first page', () => {
    const params = buildPropertySearchParams({ sort: 'newest', page: 1 })

    expect(params.has('sort')).toBe(false)
    expect(params.has('page')).toBe(false)
  })
})

describe('mapProperty', () => {
  it('converts an API record into the view model', () => {
    const property = mapProperty(backendProperty as never)

    expect(property).toMatchObject({
      id: 7,
      type: 'Warehouses',
      listingType: 'For Rent',
      price: 45000,
      area: 850,
      location: 'J.C. Aquino Ave, Libertad, Butuan City, Agusan del Norte',
      contactName: 'Ana Owner',
      contactRole: 'Owner',
      latitude: 8.9475,
    })
  })

  it('maps the verified publisher and contact details', () => {
    const property = mapProperty(backendProperty as never)

    expect(property.publisher).toMatchObject({ id: 1, verified: true, roleLabel: 'Property owner', contact: { phone: '09171234567', email: null } })
  })

  it('puts the primary photo first and resolves relative paths', () => {
    const property = mapProperty(backendProperty as never)

    expect(property.images[0]).toBe('https://cdn.example.test/primary.jpg')
    expect(property.images[1]).toMatch(/^https?:\/\/.+\/storage\/properties\/second\.jpg$/)
  })
})

describe('fetchPublicProperties', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('returns pagination details from the API', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      data: [backendProperty],
      meta: { total: 30, current_page: 2, last_page: 3, per_page: 12 },
    })))

    const result = await fetchPublicProperties({ page: 2, perPage: 12 })

    expect(result).toMatchObject({ total: 30, currentPage: 2, lastPage: 3 })
    expect(result.properties).toHaveLength(1)
  })
})

describe('generateListingDescription', () => {
  afterEach(() => vi.unstubAllGlobals())

  const request = { title: 'Office', area: 120, location: 'Butuan City', price: 50000, propertyType: 'Office Spaces', listingType: 'For Rent' }

  it('returns the trimmed description', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ success: true, description: '  Bright office.  ' })))

    await expect(generateListingDescription(request)).resolves.toBe('Bright office.')
  })

  it('surfaces the service message when generation is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ success: false, message: 'AI is disabled.' })))

    await expect(generateListingDescription(request)).rejects.toThrow('AI is disabled.')
  })

  it('rejects empty descriptions', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ success: true, description: '   ' })))

    await expect(generateListingDescription(request)).rejects.toThrow(/empty description/)
  })
})
