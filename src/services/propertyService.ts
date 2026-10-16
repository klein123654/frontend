import { API_ORIGIN, apiRequest } from './api'
import type { ListingType, Property, PropertyType } from '@/types/property'
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
  status?: string
  created_at?: string
  inquiries_count?: number
  review_notes?: string | null
  owner?: { name: string }
  broker?: { name: string } | null
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
    latitude: record.latitude == null ? null : Number(record.latitude),
    longitude: record.longitude == null ? null : Number(record.longitude),
  }
}

function listingFormData(input: ListingInput): FormData {
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
  input.images.forEach((file) => data.append('images[]', file))
  return data
}

export async function fetchMyListings() {
  const response = await apiRequest<{ data: BackendProperty[] }>('my/properties?per_page=50')
  return response.data.map(mapListing)
}

export async function createMyListing(input: ListingInput) {
  const response = await apiRequest<{ data: BackendProperty }>('my/properties', {
    method: 'POST', body: listingFormData(input),
  })
  return mapListing(response.data)
}

export async function updateMyListing(id: number, input: ListingInput) {
  const data = listingFormData(input)
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
  }
}

interface SingleResponse {
  data: BackendProperty
}

export interface PropertySearchFilters {
  search?: string
  propertyType?: string
  listingType?: string
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

function mapProperty(record: BackendProperty): Property {
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
    images,
    contactName: record.broker?.name || record.owner?.name || 'Listing contact',
    contactRole: record.broker_id ? 'Broker' : 'Owner',
    featured: false,
    latitude: record.latitude == null ? null : Number(record.latitude),
    longitude: record.longitude == null ? null : Number(record.longitude),
  }
}

export async function fetchPublicProperties(
  filters: PropertySearchFilters = {},
): Promise<{ properties: Property[]; total: number }> {
  const params = new URLSearchParams()
  params.set('per_page', '50')

  if (filters.search?.trim()) {
    params.set('search', filters.search.trim())
  }

  if (filters.propertyType) {
    params.set('property_type', filters.propertyType)
  }

  if (filters.listingType) {
    params.set('listing_type', listingTypeToApiValue(filters.listingType as ListingType))
  }

  const query = params.toString()
  const response = await apiRequest<PaginatedResponse>(
    `properties?${query}`,
  )

  return {
    properties: response.data.map(mapProperty),
    total: response.meta?.total ?? response.data.length,
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
