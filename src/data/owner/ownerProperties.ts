import { formatPeso } from '@/utils/format'
import type { ListingAvailability } from '@/types/property'
import type { ListingPhoto } from '@/types/listingPhotos'

export type OwnerListingStatus =
  | 'Approved'
  | 'Pending'
  | 'Draft'
  | 'Rejected'

export type OwnerListingType = 'For Rent' | 'For Lease' | 'For Sale'

export interface OwnerProperty {
  id: number
  title: string
  location: string
  city: string
  province: string
  barangay: string
  propertyType:
    | 'Office Spaces'
    | 'Retail Spaces'
    | 'Warehouses'
    | 'Commercial Lots'
  listingType: OwnerListingType
  price: number
  area: number
  description: string
  status: OwnerListingStatus
  images: string[]
  /** Uploaded photos with ids, for managing them in the edit form. */
  photos?: ListingPhoto[]
  inquiries: number
  /** Public page views (counted once per visitor per hour). */
  views?: number
  dateCreated: string
  availability: ListingAvailability
  availabilityConfirmedAt: string | null
  reviewNotes?: string | null
  latitude?: number | null
  longitude?: number | null
}

export const ownerProperties: OwnerProperty[] = []

export const formatOwnerPrice = formatPeso
