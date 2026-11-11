import { formatPeso } from '@/utils/format'
import type { ListingType, PropertyType } from '@/types/property'

export type BrokerListingStatus = 'Approved' | 'Pending' | 'Draft' | 'Rejected'

export interface BrokerListing {
  id: number
  title: string
  location: string
  city: string
  province: string
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
  latitude?: number | null
  longitude?: number | null
}

export type BrokerListingInput = Omit<BrokerListing, 'id' | 'images' | 'inquiries' | 'dateCreated' | 'status'> & {
  status: 'Draft' | 'Pending'
  images?: File[]
}

export const brokerListings: BrokerListing[] = []

export const formatBrokerPrice = formatPeso
