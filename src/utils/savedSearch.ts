import type { LocationQueryRaw } from 'vue-router'
import { listingTypeToApiValue } from '@/services/propertyService'
import type { SavedSearchFilters } from '@/services/savedSearchService'
import type { ListingType } from '@/types/property'
import { formatPeso } from '@/utils/format'
import { ALL_LISTINGS, ALL_TYPES, toBrowseQuery, type PropertyBrowseState } from '@/utils/propertyQuery'

const LISTING_LABELS: Record<string, ListingType> = { rent: 'For Rent', lease: 'For Lease', sale: 'For Sale' }

/** The parts of the browse filters a saved search can remember (tags and sort are left out). */
export function filtersFromBrowseState(state: PropertyBrowseState): SavedSearchFilters {
  const filters: SavedSearchFilters = {}
  if (state.search.trim()) filters.search = state.search.trim()
  if (state.propertyType && state.propertyType !== ALL_TYPES) filters.property_type = state.propertyType
  if (state.listingType && state.listingType !== ALL_LISTINGS) filters.listing_type = listingTypeToApiValue(state.listingType as ListingType)
  if (state.barangay.trim()) filters.barangay = state.barangay.trim()
  if (state.minPrice !== null) filters.min_price = state.minPrice
  if (state.maxPrice !== null) filters.max_price = state.maxPrice
  return filters
}

export function hasSavableFilters(filters: SavedSearchFilters): boolean {
  return Object.keys(filters).length > 0
}

/** Browse-page URL query that re-runs a saved search. */
export function browseQueryFromFilters(filters: SavedSearchFilters): LocationQueryRaw {
  return toBrowseQuery({
    search: filters.search ?? '',
    propertyType: filters.property_type ?? ALL_TYPES,
    listingType: filters.listing_type ? LISTING_LABELS[filters.listing_type] ?? ALL_LISTINGS : ALL_LISTINGS,
    barangay: filters.barangay ?? '',
    tags: [],
    minPrice: filters.min_price ?? null,
    maxPrice: filters.max_price ?? null,
    sort: 'newest',
    page: 1,
  })
}

/** Human-readable name, e.g. "Warehouses for rent in Bancasi under ₱100,000". */
export function describeFilters(filters: SavedSearchFilters): string {
  let text = filters.property_type ?? 'Commercial spaces'
  if (filters.listing_type) text += ` ${(LISTING_LABELS[filters.listing_type] ?? '').toLowerCase()}`
  if (filters.barangay) text += ` in ${filters.barangay}`
  if (filters.min_price != null && filters.max_price != null) text += ` (${formatPeso(filters.min_price)}–${formatPeso(filters.max_price)})`
  else if (filters.max_price != null) text += ` under ${formatPeso(filters.max_price)}`
  else if (filters.min_price != null) text += ` from ${formatPeso(filters.min_price)}`
  if (filters.search) text += ` matching “${filters.search}”`
  return text.slice(0, 120)
}
