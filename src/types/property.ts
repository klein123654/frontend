export type PropertyType =
  | 'Office Spaces'
  | 'Retail Spaces'
  | 'Warehouses'
  | 'Commercial Lots'

export type ListingType = 'For Rent' | 'For Lease' | 'For Sale'

export type ListingAvailability = 'available' | 'rented' | 'sold'

/** Contact links a publisher chose to show publicly. */
export interface PublisherContact {
  phone: string | null
  email: string | null
  messengerUrl: string | null
  viberUrl: string | null
}

/** Public profile of the owner, developer or broker who posted a listing. */
export interface Publisher {
  id: number
  name: string
  role: 'owner' | 'developer' | 'broker'
  roleLabel: string
  verified: boolean
  licenseNumber: string | null
  agencyName: string | null
  memberSince: string | null
  contact: PublisherContact
  activeListingCount?: number
}

export interface Property {
  id: number
  title: string
  location: string
  barangay: string
  type: PropertyType
  listingType: ListingType
  price: number
  area: number
  description: string
  aiTags: string[]
  images: string[]
  contactName: string
  contactRole: 'Owner' | 'Broker'
  featured: boolean
  latitude?: number | null
  longitude?: number | null
  publisher?: Publisher | null
}
