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

  it('sends email and password as JSON and shows the backend message without logging it', async () => {
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
    expect(logSpy).not.toHaveBeenCalled()
  })
})

describe('API error messages', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function respond(status: number, body: unknown) {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })))
  }

  it('never shows storage configuration details', async () => {
    respond(500, { message: 'Check the Supabase bucket', type: 'storage_error' })
    await expect(apiRequest('my/properties')).rejects.toThrow('Your photos could not be uploaded right now. Please try again in a few minutes.')
  })

  it('shows the first field error for validation problems', async () => {
    respond(422, { message: 'Please review the form.', type: 'validation_error', errors: { images: ['A listing can have up to 10 photos. You can add 1 more.'] } })
    await expect(apiRequest('my/properties/1')).rejects.toThrow('A listing can have up to 10 photos. You can add 1 more.')
  })

  it('falls back to a plain message instead of a status code', async () => {
    respond(409, {})
    await expect(apiRequest('anything')).rejects.toThrow('Something went wrong. Please try again.')
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
