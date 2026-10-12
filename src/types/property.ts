export type PropertyType =
  | 'Office Spaces'
  | 'Retail Spaces'
  | 'Warehouses'
  | 'Commercial Lots'

export type ListingType = 'For Rent' | 'For Sale'

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
  images: string[]
  contactName: string
  contactRole: 'Owner' | 'Broker'
  featured: boolean
}
