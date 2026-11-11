import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiRequest } from './api'
import { loginUser } from './authService'
import { createMyListing } from './propertyService'

describe('login API requests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('sends email and password as JSON and logs backend 422 details', async () => {
    const responseBody = {
      message: 'The provided credentials are incorrect.',
    }
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(responseBody), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    }))
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.stubGlobal('fetch', fetchMock)

    await expect(loginUser('agent@example.test', 'wrong-password'))
      .rejects.toThrow('The provided credentials are incorrect.')

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(requestUrl).toMatch(/\/api\/login$/)
    const headers = new Headers(requestOptions.headers)
    expect(headers.get('Accept')).toBe('application/json')
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(JSON.parse(String(requestOptions.body))).toEqual({
      email: 'agent@example.test',
      password: 'wrong-password',
    })
    expect(logSpy).toHaveBeenCalledWith('[API] Request rejected with 422', {
      path: 'login',
      message: 'The provided credentials are incorrect.',
      errors: undefined,
    })
  })
})

describe('property image upload requests', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('sends selected files as images[] FormData without overriding the multipart boundary', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({
      data: {
        id: 321,
        title: 'Warehouse test',
        property_type: 'Warehouses',
        listing_type: 'rent',
        description: 'A test warehouse listing.',
        price: '50000',
        address_line: 'Bancasi',
        barangay: 'Bancasi',
        city: 'Butuan City',
        province: 'Agusan del Norte',
        floor_area: '420',
        status: 'draft',
        images: [],
      },
    }), { status: 201, headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)

    const image = new File(['image bytes'], 'warehouse.png', { type: 'image/png' })
    await createMyListing({
      title: 'Warehouse test',
      propertyType: 'Warehouses',
      listingType: 'For Rent',
      barangay: 'Bancasi',
      location: 'Bancasi',
      city: 'Butuan City',
      province: 'Agusan del Norte',
      area: 420,
      price: 50000,
      description: 'A test warehouse listing.',
      images: [image],
      status: 'Draft',
    })

    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] as [string, RequestInit]
    const formData = requestOptions.body as FormData

    expect(requestUrl).toMatch(/\/api\/my\/properties$/)
    expect(formData.get('title')).toBe('Warehouse test')
    expect(formData.getAll('images[]')).toHaveLength(1)
    expect(formData.get('images[]')).toBeInstanceOf(File)
    expect((formData.get('images[]') as File).name).toBe('warehouse.png')
    expect((formData.get('images[]') as File).type).toBe('image/png')
    expect(new Headers(requestOptions.headers).has('Content-Type')).toBe(false)
  })

  it('removes a caller-supplied Content-Type so fetch generates the multipart boundary', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ data: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))
    vi.stubGlobal('fetch', fetchMock)
    const body = new FormData()
    body.append('images[]', new File(['image bytes'], 'warehouse.png', { type: 'image/png' }))

    await apiRequest('my/properties', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })

    const [, requestOptions] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(new Headers(requestOptions.headers).has('Content-Type')).toBe(false)
    expect(requestOptions.body).toBe(body)
  })
})
