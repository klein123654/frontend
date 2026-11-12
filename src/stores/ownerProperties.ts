import { ref } from 'vue'
import { createMyListing, deleteMyListing, fetchMyListings, updateListingAvailability, updateMyListing } from '@/services/propertyService'
import type { ListingAvailability, ListingType, PropertyType } from '@/types/property'
import type { OwnerProperty } from '@/data/owner/ownerProperties'

export interface NewOwnerPropertyInput {
  title: string
  propertyType: PropertyType | null
  listingType: ListingType | null
  barangay: string
  location: string
  city: string
  province: string
  latitude?: number | null
  longitude?: number | null
  price: number | null
  area: number | null
  description: string
  status: 'Draft' | 'Pending'
  images?: File[]
}

export const allOwnerProperties = ref<OwnerProperty[]>([])

export async function loadOwnerProperties(): Promise<void> {
  allOwnerProperties.value = await fetchMyListings()
}

export async function addOwnerProperty(input: NewOwnerPropertyInput): Promise<OwnerProperty> {
  const property = await createMyListing({
    ...input,
    propertyType: input.propertyType ?? 'Office Spaces',
    listingType: input.listingType ?? 'For Rent',
    price: input.price ?? 0,
    area: input.area ?? 0,
    images: input.images ?? [],
  })
  allOwnerProperties.value = [property, ...allOwnerProperties.value]
  return property
}

/** Owners can edit any of their own listings; editing a live or pending one sends it back to review. */
export function getEditableOwnerProperty(id: number): OwnerProperty | undefined {
  return allOwnerProperties.value.find((property) => property.id === id)
}

export async function updateOwnerProperty(id: number, input: NewOwnerPropertyInput): Promise<OwnerProperty> {
  const property = await updateMyListing(id, {
    ...input,
    propertyType: input.propertyType ?? 'Office Spaces',
    listingType: input.listingType ?? 'For Rent',
    price: input.price ?? 0,
    area: input.area ?? 0,
    images: input.images ?? [],
  })
  allOwnerProperties.value = allOwnerProperties.value.map((item) => item.id === id ? property : item)
  return property
}

export async function deleteOwnerProperty(id: number): Promise<void> {
  await deleteMyListing(id)
  allOwnerProperties.value = allOwnerProperties.value.filter((property) => property.id !== id)
}

/** Save a listing's availability. Resolves to an error message, or '' on success. */
export async function setOwnerPropertyAvailability(id: number, availability: ListingAvailability): Promise<string> {
  try {
    const property = await updateListingAvailability(id, availability)
    allOwnerProperties.value = allOwnerProperties.value.map((item) => item.id === id ? property : item)
    return ''
  } catch (error) {
    return error instanceof Error ? error.message : 'Unable to update availability.'
  }
}
