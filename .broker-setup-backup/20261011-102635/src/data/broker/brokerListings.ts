
import type {
  PropertyType,
  ListingType
} from '@/types/property'

// BROKER LISTING STATUS
export type BrokerListingStatus =
  | 'Approved'
  | 'Pending'
  | 'Draft'
  | 'Rejected'

// BROKER LISTING DATA STRUCTURE
export interface BrokerListing {
  id: number
  title: string
  location: string
  barangay: string
  propertyType: PropertyType
  listingType: ListingType
  price: number
  area: number
  description: string
  status: BrokerListingStatus
  images: string[]
  inquiries: number
  dateCreated: string
}

// NO HARDCODED PROPERTY LISTINGS.
// Real records will come from the backend later.
export const brokerListings: BrokerListing[] = []

// FORMAT PROPERTY PRICES IN PHILIPPINE PESOS
export function formatBrokerPrice(price: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(price)
}
