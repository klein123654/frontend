import { ref } from 'vue'
import { createMyListing, deleteMyListing, fetchMyListings, updateMyListing } from '@/services/propertyService'
import type { BrokerListing, BrokerListingInput } from '@/data/broker/brokerListings'

export const allBrokerListings = ref<BrokerListing[]>([])

export async function loadBrokerListings(): Promise<void> {
  allBrokerListings.value = await fetchMyListings() as BrokerListing[]
}

export function getBrokerListing(id: number): BrokerListing | undefined {
  return allBrokerListings.value.find((item) => item.id === id)
}

export function getEditableBrokerListing(id: number): BrokerListing | undefined {
  return allBrokerListings.value.find((item) => item.id === id && ['Draft', 'Rejected'].includes(item.status))
}

export async function addBrokerListing(input: BrokerListingInput): Promise<BrokerListing> {
  const listing = await createMyListing({ ...input, images: input.images ?? [] })
  const result = listing as BrokerListing
  allBrokerListings.value = [result, ...allBrokerListings.value]
  return result
}

export async function updateBrokerListing(id: number, input: BrokerListingInput): Promise<boolean> {
  try {
    const updated = await updateMyListing(id, { ...input, images: input.images ?? [] })
    allBrokerListings.value = allBrokerListings.value.map((item) => item.id === id ? updated as BrokerListing : item)
    return true
  } catch {
    return false
  }
}

export async function deleteBrokerListing(id: number): Promise<boolean> {
  try {
    await deleteMyListing(id)
    allBrokerListings.value = allBrokerListings.value.filter((item) => item.id !== id)
    return true
  } catch {
    return false
  }
}
