import { computed, ref } from 'vue'
import {
  brokerListings,
  type BrokerListing,
  type BrokerListingInput
} from '@/data/broker/brokerListings'

const KEY = 'butuanspaces-broker-listings-v1'

function load(): BrokerListing[] {
  try {
    const raw = localStorage.getItem(KEY)
    const value: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(value)) return []
    return value.filter((item): item is BrokerListing => {
      if (typeof item !== 'object' || item === null) return false
      const listing = item as Partial<BrokerListing>
      return Number.isSafeInteger(listing.id) && Number(listing.id) > 0 &&
        typeof listing.title === 'string' &&
        typeof listing.location === 'string' &&
        typeof listing.barangay === 'string' &&
        typeof listing.propertyType === 'string' &&
        typeof listing.listingType === 'string' &&
        typeof listing.price === 'number' &&
        typeof listing.area === 'number' &&
        typeof listing.description === 'string' &&
        ['Draft', 'Pending', 'Approved', 'Rejected'].includes(listing.status ?? '') &&
        Array.isArray(listing.images) &&
        typeof listing.dateCreated === 'string' &&
        typeof listing.inquiries === 'number'
    })
  } catch {
    return []
  }
}

const localListings = ref<BrokerListing[]>(load())
export const allBrokerListings = computed(() => [...brokerListings, ...localListings.value])

function persist(): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(localListings.value))
    return true
  } catch {
    return false
  }
}

export function getBrokerListing(id: number): BrokerListing | undefined {
  return allBrokerListings.value.find((item) => item.id === id)
}

export function getEditableBrokerListing(id: number): BrokerListing | undefined {
  return localListings.value.find((item) => item.id === id && item.status === 'Draft')
}

export function addBrokerListing(input: BrokerListingInput): { id: number; persisted: boolean } {
  const id = Math.max(0, ...allBrokerListings.value.map((item) => item.id)) + 1
  const listing: BrokerListing = {
    ...input,
    id,
    images: [],
    inquiries: 0,
    dateCreated: new Date().toISOString().slice(0, 10)
  }
  localListings.value = [...localListings.value, listing]
  return { id, persisted: persist() }
}

export function updateBrokerListing(id: number, input: BrokerListingInput): boolean {
  if (!getEditableBrokerListing(id) || input.status !== 'Draft') return false
  localListings.value = localListings.value.map((listing) =>
    listing.id === id ? { ...listing, ...input, status: 'Draft' } : listing
  )
  return persist()
}
