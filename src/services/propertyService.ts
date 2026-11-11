import { API_ORIGIN, apiRequest } from './api'
import { compressImage } from '@/utils/imageCompression'
import type { ListingAvailability, ListingType, Property, PropertyType, Publisher } from '@/types/property'
import type { OwnerProperty } from '@/data/owner/ownerProperties'
import { BUTUAN_CITY, BUTUAN_PROVINCE, canonicalButuanBarangay } from '@/data/butuanLocation'

interface BackendImage {
  path: string
  alt_text?: string | null
  sort_order?: number
  is_primary?: boolean
}

export interface BackendProperty {
  id: number
  title: string
  property_type: string
  listing_type: string
  description: string
  price: number | string
  currency?: string
  address_line?: string
  barangay?: string | null
  city?: string
  province?: string
  latitude?: number | string | null
  longitude?: number | string | null
  floor_area?: number | string | null
  lot_area?: number | string | null
  broker_id?: number | null
  images?: BackendImage[]
  ai_tags?: string[]
  status?: string
  created_at?: string
  inquiries_count?: number
  review_notes?: string | null
  owner?: { name: string }
  broker?: { name: string } | null
  availability?: ListingAvailability
  availability_confirmed_at?: string | null
  publisher?: BackendPublisher | null
}

export interface BackendPublisher {
  id: number
  name: string
  role: Publisher['role']
  role_label: string
  verified: boolean
  license_number: string | null
  agency_name: string | null
  member_since: string | null
  active_listing_count?: number
  contact?: { phone: string | null; email: string | null; messenger_url: string | null; viber_url: string | null }
}

export function mapPublisher(record: BackendPublisher): Publisher {
  return {
    id: record.id,
    name: record.name,
    role: record.role,
    roleLabel: record.role_label,
    verified: record.verified,
    licenseNumber: record.license_number,
    agencyName: record.agency_name,
    memberSince: record.member_since,
    activeListingCount: record.active_listing_count,
    contact: {
      phone: record.contact?.phone ?? null,
      email: record.contact?.email ?? null,
      messengerUrl: record.contact?.messenger_url ?? null,
      viberUrl: record.contact?.viber_url ?? null,
    },
  }
}

export interface ListingInput {
  title: string
  propertyType: PropertyType
  listingType: ListingType
  barangay: string
  location: string
  city: string
  province: string
  area: number
  latitude?: number | null
  longitude?: number | null
  price: number
  description: string
  images: File[]
  status: 'Draft' | 'Pending'
}

export function mapListing(record: BackendProperty): OwnerProperty {
  const mapped = mapProperty(record)
  return {
    id: record.id,
    title: record.title,
    location: record.address_line || '',
    barangay: record.barangay ?? '',
    city: record.city ?? '',
    province: record.province ?? '',
    propertyType: mapped.type,
    listingType: mapped.listingType,
    price: mapped.price,
    area: mapped.area,
    description: mapped.description,
    status: (({ draft: 'Draft', pending: 'Pending', published: 'Approved', rejected: 'Rejected' } as Record<string, OwnerProperty['status']>)[record.status ?? 'draft'] ?? 'Draft'),
    images: mapped.images,
    inquiries: record.inquiries_count ?? 0,
    dateCreated: record.created_at?.slice(0, 10) ?? '',
    reviewNotes: record.review_notes ?? null,
    availability: record.availability ?? 'available',
    availabilityConfirmedAt: record.availability_confirmed_at ?? null,
    latitude: record.latitude == null ? null : Number(record.latitude),
    longitude: record.longitude == null ? null : Number(record.longitude),
  }
}

async function listingFormData(input: ListingInput): Promise<FormData> {
  const data = new FormData()
  data.set('title', input.title)
  data.set('property_type', input.propertyType)
  data.set('listing_type', listingTypeToApiValue(input.listingType))
  data.set('description', input.description)
  data.set('price', String(input.price))
  data.set('address_line', input.location)
  data.set('barangay', canonicalButuanBarangay(input.barangay) ?? input.barangay.trim())
  data.set('city', BUTUAN_CITY)
  data.set('province', BUTUAN_PROVINCE)
  if (input.latitude != null) data.set('latitude', String(input.latitude))
  if (input.longitude != null) data.set('longitude', String(input.longitude))
  data.set('floor_area', String(input.area))
  data.set('submit_for_review', input.status === 'Pending' ? '1' : '0')
  const images = await Promise.all(input.images.map((file) => compressImage(file)))
  images.forEach((file) => data.append('images[]', file))
  return data
}

export async function fetchMyListings() {
  const response = await apiRequest<{ data: BackendProperty[] }>('my/properties?per_page=50')
  return response.data.map(mapListing)
}

export async function createMyListing(input: ListingInput) {
  const response = await apiRequest<{ data: BackendProperty }>('my/properties', {
    method: 'POST', body: await listingFormData(input),
  })
  return mapListing(response.data)
}

export async function updateMyListing(id: number, input: ListingInput) {
  const data = await listingFormData(input)
  data.set('_method', 'PATCH')
  const response = await apiRequest<{ data: BackendProperty }>(`my/properties/${id}`, {
    method: 'POST', body: data,
  })
  return mapListing(response.data)
}

export async function deleteMyListing(id: number): Promise<void> {
  await apiRequest(`my/properties/${id}`, { method: 'DELETE' })
}

interface PaginatedResponse {
  data: BackendProperty[]
  meta?: {
    total?: number
    current_page?: number
    last_page?: number
  }
}

interface SingleResponse {
  data: BackendProperty
}

export interface PropertySearchFilters {
  search?: string
  propertyType?: string
  listingType?: string
  aiTags?: string[]
  minPrice?: number | null
  maxPrice?: number | null
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc'
  barangay?: string
  publisherId?: number
  page?: number
  perPage?: number
}

export interface PropertySearchResult {
  properties: Property[]
  total: number
  currentPage: number
  lastPage: number
}

function normalizePropertyType(value: string): PropertyType {
  const normalized = value.toLowerCase()

  if (normalized.includes('office')) return 'Office Spaces'
  if (normalized.includes('retail')) return 'Retail Spaces'
  if (normalized.includes('warehouse')) return 'Warehouses'
  if (normalized.includes('lot')) return 'Commercial Lots'

  return value as PropertyType
}

function normalizeListingType(value: string): ListingType {
  const normalized = value.toLowerCase()

  if (normalized.includes('lease')) return 'For Lease'
  if (normalized.includes('rent')) return 'For Rent'
  if (normalized.includes('sale')) return 'For Sale'

  return value as ListingType
}

function listingTypeToApiValue(value: ListingType): string {
  if (value === 'For Rent') return 'rent'
  if (value === 'For Lease') return 'lease'
  return 'sale'
}

function resolveImageUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  if (path.startsWith('/')) return `${API_ORIGIN}${path}`

  return `${API_ORIGIN}/${path}`
}

export function mapProperty(record: BackendProperty): Property {
  const images = [...(record.images ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })
    .map((image) => resolveImageUrl(image.path))

  const location = [
    record.address_line,
    record.barangay,
    record.city,
    record.province,
  ]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(', ')

  return {
    id: record.id,
    title: record.title,
    location: location || 'Location not specified',
    barangay: record.barangay ?? '',
    type: normalizePropertyType(record.property_type),
    listingType: normalizeListingType(record.listing_type),
    price: Number(record.price),
    area: Number(record.floor_area ?? record.lot_area ?? 0),
    description: record.description,
    aiTags: record.ai_tags ?? [],
    images,
    contactName: record.broker?.name || record.owner?.name || 'Listing contact',
    contactRole: record.broker_id ? 'Broker' : 'Owner',
    featured: false,
    latitude: record.latitude == null ? null : Number(record.latitude),
    longitude: record.longitude == null ? null : Number(record.longitude),
    publisher: record.publisher ? mapPublisher(record.publisher) : null,
  }
}

export function buildPropertySearchParams(filters: PropertySearchFilters = {}): URLSearchParams {
  const params = new URLSearchParams()
  params.set('per_page', String(filters.perPage ?? 50))

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  if (filters.propertyType) {
    params.set('property_type', filters.propertyType)
  }

  if (filters.listingType) {
    params.set('listing_type', listingTypeToApiValue(filters.listingType as ListingType))
  }

  if (filters.barangay?.trim()) params.set('barangay', filters.barangay.trim())
  if (filters.publisherId) params.set('publisher', String(filters.publisherId))
  if (filters.minPrice != null) params.set('min_price', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('max_price', String(filters.maxPrice))
  if (filters.sort && filters.sort !== 'newest') params.set('sort', filters.sort)
  if (filters.page && filters.page > 1) params.set('page', String(filters.page))

  filters.aiTags?.forEach((tag) => params.append('ai_tags[]', tag))

  return params
}

export async function fetchPublicProperties(
  filters: PropertySearchFilters = {},
): Promise<PropertySearchResult> {
  const response = await apiRequest<PaginatedResponse>(
    `properties?${buildPropertySearchParams(filters).toString()}`,
  )

  return {
    properties: response.data.map(mapProperty),
    total: response.meta?.total ?? response.data.length,
    currentPage: response.meta?.current_page ?? 1,
    lastPage: response.meta?.last_page ?? 1,
  }
}

export async function fetchPublicProperty(
  idOrSlug: string | number,
): Promise<Property> {
  const response = await apiRequest<SingleResponse>(
    `properties/${encodeURIComponent(String(idOrSlug))}`,
  )

  return mapProperty(response.data)
}

export interface DescriptionRequest {
  title: string
  area: number | null
  location: string
  price: number | null
  propertyType: string
  listingType: string
}

/** Ask the AI service to draft a listing description. Throws with a user-facing message on failure. */
export async function generateListingDescription(input: DescriptionRequest): Promise<string> {
  const response = await apiRequest<{ success: boolean; description?: string; message?: string }>('ai/describe', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      size: input.area,
      location: input.location,
      price: input.price,
      type: input.propertyType,
      listing_type: input.listingType,
    }),
  })

  if (!response.success) {
    throw new Error(response.message || 'AI description generation is unavailable.')
  }

  const description = response.description?.trim()
  if (!description) {
    throw new Error('The AI returned an empty description. Please try again.')
  }

  return description
}

/** Public profile of a verified publisher. */
export async function fetchPublisher(id: number | string): Promise<Publisher> {
  const response = await apiRequest<{ data: BackendPublisher }>(`publishers/${encodeURIComponent(String(id))}`)
  return mapPublisher(response.data)
}

export interface BarangayCount {
  barangay: string
  count: number
}

/** Number of live listings per barangay, most first. */
export async function fetchBarangayCounts(): Promise<BarangayCount[]> {
  const response = await apiRequest<{ data: { barangay: string; listing_count: number }[] }>('barangays')
  return response.data.map((row) => ({ barangay: row.barangay, count: row.listing_count }))
}

/** Mark one of your listings as still available, rented or sold. */
export async function updateListingAvailability(id: number, availability: ListingAvailability): Promise<OwnerProperty> {
  const response = await apiRequest<{ data: BackendProperty }>(`my/properties/${id}/availability`, {
    method: 'PATCH',
    body: JSON.stringify({ availability }),
  })
  return mapListing(response.data)
}

/** Report a listing that looks fake, outdated or misleading. */
export async function reportListing(
  id: number,
  report: { reason: string; details?: string; email?: string; name?: string },
): Promise<void> {
  await apiRequest(`properties/${id}/reports`, {
    method: 'POST',
    body: JSON.stringify({
      reason: report.reason,
      details: report.details || undefined,
      email: report.email || undefined,
      name: report.name || undefined,
    }),
  })
}
