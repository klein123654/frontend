export type PropertyType =
  | 'Office Spaces'
  | 'Retail Spaces'
  | 'Warehouses'
  | 'Commercial Lots'

export type ListingType = 'For Rent' | 'For Lease' | 'For Sale'

/** reserved: an offer is being negotiated; rented/sold listings stay visible for 30 days, marked unavailable. */
export type ListingAvailability = 'available' | 'reserved' | 'rented' | 'sold'

/** current/expiring: valid; expired: PRC licence or DHSUD registration lapsed; missing: dates never given. */
export type CredentialStatus = 'current' | 'expiring' | 'expired' | 'missing'

/** A licensed broker's credentials and the real estate firm they belong to. */
export interface BrokerCredentialsInfo {
  licenseNumber: string | null
  prcValidUntil: string | null
  dhsudRegistrationNumber: string | null
  dhsudValidUntil: string | null
  credentialStatus: CredentialStatus
  firm: { name: string; position: string | null; address: string | null; registrationNumber: string | null } | null
  affiliations: string[]
}

/** Contact links a publisher chose to show publicly. */
export interface PublisherContact {
  phone: string | null
  email: string | null
  messengerUrl: string | null
  viberUrl: string | null
}

/** Public profile of the owner or broker who posted a listing. */
export interface Publisher {
  id: number
  name: string
  role: 'owner' | 'broker'
  roleLabel: string
  /** Owners: approved. Brokers: verified and both credentials still valid. */
  verified: boolean
  broker?: BrokerCredentialsInfo | null
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
  availability: ListingAvailability
}
