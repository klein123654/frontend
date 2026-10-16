
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
  inquiries: number
  dateCreated: string
  reviewNotes?: string | null
  latitude?: number | null
  longitude?: number | null
}

export const ownerProperties: OwnerProperty[] = []

export function formatOwnerPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(price)
}
