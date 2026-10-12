
import { computed, ref } from 'vue'

import {
  ownerProperties,
  type OwnerProperty
} from '@/data/owner/ownerProperties'

import type {
  PropertyType,
  ListingType
} from '@/types/property'

// Browser storage key for this prototype.
// Keep this unchanged to preserve existing saved listings.
const STORAGE_KEY = 'butuanspaces-owner-properties-v1'

// Information received from the Add Property form.
export interface NewOwnerPropertyInput {
  title: string
  propertyType: PropertyType | null
  listingType: ListingType | null
  barangay: string
  location: string
  price: number | null
  area: number | null
  description: string
  status: 'Draft' | 'Pending'
}

// Safely read previously saved demo listings.
function loadSavedProperties(): OwnerProperty[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return []
    }

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(
      (item): item is OwnerProperty =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.id === 'number' &&
        Number.isFinite(item.id) &&
        typeof item.title === 'string' &&
        typeof item.location === 'string' &&
        typeof item.barangay === 'string' &&
        typeof item.price === 'number' &&
        typeof item.area === 'number' &&
        typeof item.description === 'string' &&
        typeof item.dateCreated === 'string' &&
        typeof item.inquiries === 'number' &&
        Array.isArray(item.images) &&
        item.images.every(
          (image: unknown) => typeof image === 'string'
        ) &&
        ['Draft', 'Pending'].includes(item.status) &&
        [
          'Office Spaces',
          'Retail Spaces',
          'Warehouses',
          'Commercial Lots'
        ].includes(item.propertyType) &&
        ['For Rent', 'For Sale'].includes(item.listingType)
    )
  } catch (error) {
    console.warn(
      'Could not load saved demo properties:',
      error
    )

    return []
  }
}

// Reactive properties stored in the browser.
const savedProperties = ref<OwnerProperty[]>(
  loadSavedProperties()
)

// Combine original sample listings and locally saved listings.
export const allOwnerProperties = computed<OwnerProperty[]>(
  () => [
    ...ownerProperties,
    ...savedProperties.value
  ]
)

// Save local properties to browser storage.
function persistProperties(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(savedProperties.value)
    )

    return true
  } catch (error) {
    console.warn(
      'Could not save demo properties:',
      error
    )

    return false
  }
}

// Generate the next numeric property ID.
function getNextPropertyId(): number {
  const highestId = allOwnerProperties.value.reduce(
    (highest, property) =>
      Math.max(highest, property.id),
    0
  )

  return highestId + 1
}

// CREATE PROPERTY
// Add a new locally saved Draft or Pending listing.
export function addOwnerProperty(
  input: NewOwnerPropertyInput
): {
  property: OwnerProperty
  persisted: boolean
} {
  const newProperty: OwnerProperty = {
    id: getNextPropertyId(),

    title: input.title.trim(),

    propertyType:
      input.propertyType ?? 'Office Spaces',

    listingType:
      input.listingType ?? 'For Rent',

    barangay: input.barangay.trim(),

    location: input.location.trim(),

    price: input.price ?? 0,

    area: input.area ?? 0,

    description: input.description.trim(),

    status: input.status,

    // Actual image files will be handled
    // when the Laravel backend is implemented.
    images: [],

    inquiries: 0,

    dateCreated: new Date().toISOString().slice(0, 10)
  }

  // Update reactive state.
  savedProperties.value.push(newProperty)

  // Save to the browser.
  const persisted = persistProperties()

  return {
    property: newProperty,
    persisted
  }
}

// FIND EDITABLE PROPERTY
// Only browser-saved Draft listings can be edited.
// Original fictional sample listings remain read-only.
export function getEditableOwnerProperty(
  id: number
): OwnerProperty | undefined {
  return savedProperties.value.find(
    (property) =>
      property.id === id &&
      property.status === 'Draft'
  )
}

// UPDATE PROPERTY
// Modify the existing Draft listing instead of
// creating a duplicate property.
export function updateOwnerProperty(
  id: number,
  input: NewOwnerPropertyInput
): {
  updated: boolean
  persisted: boolean
} {
  const property = getEditableOwnerProperty(id)

  if (!property) {
    return {
      updated: false,
      persisted: false
    }
  }

  // Update editable information.
  property.title = input.title.trim()

  property.propertyType =
    input.propertyType ?? 'Office Spaces'

  property.listingType =
    input.listingType ?? 'For Rent'

  property.barangay = input.barangay.trim()

  property.location = input.location.trim()

  property.price = input.price ?? 0

  property.area = input.area ?? 0

  property.description = input.description.trim()

  // Keep this listing as a Draft.
  property.status = 'Draft'

  // Preserve:
  // - Property ID
  // - Original creation date
  // - Existing inquiry count
  // - Existing image references

  const persisted = persistProperties()

  return {
    updated: true,
    persisted
  }
}
