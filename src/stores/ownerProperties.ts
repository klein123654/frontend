import { ref } from 'vue'
import { createMyListing, deleteMyListing, fetchMyListings, updateMyListing } from '@/services/propertyService'
import type { ListingType, PropertyType } from '@/types/property'
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

export function getEditableOwnerProperty(id: number): OwnerProperty | undefined {
  return allOwnerProperties.value.find((property) => property.id === id && ['Draft', 'Rejected'].includes(property.status))
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
