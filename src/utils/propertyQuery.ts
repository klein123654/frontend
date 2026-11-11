import type { LocationQuery, LocationQueryRaw } from 'vue-router'

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
] as const

export type PropertySort = (typeof SORT_OPTIONS)[number]['value']

export const ALL_TYPES = 'All Types'
export const ALL_LISTINGS = 'All Listings'

/** The browse-page filters, kept in the URL so searches can be shared and bookmarked. */
export interface PropertyBrowseState {
  search: string
  propertyType: string
  listingType: string
  tags: string[]
  minPrice: number | null
  maxPrice: number | null
  sort: PropertySort
  page: number
}

function firstString(value: LocationQuery[string] | undefined): string {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first : ''
}

function parsePrice(value: string): number | null {
  if (value.trim() === '') return null
  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : null
}

function isSort(value: string): value is PropertySort {
  return SORT_OPTIONS.some((option) => option.value === value)
}

export function parseBrowseQuery(query: LocationQuery): PropertyBrowseState {
  const sort = firstString(query.sort)
  const page = Number.parseInt(firstString(query.page), 10)

  return {
    search: firstString(query.search),
    propertyType: firstString(query.type) || ALL_TYPES,
    listingType: firstString(query.listing) || ALL_LISTINGS,
    tags: firstString(query.tags).split(',').map((tag) => tag.trim()).filter(Boolean),
    minPrice: parsePrice(firstString(query.min_price)),
    maxPrice: parsePrice(firstString(query.max_price)),
    sort: isSort(sort) ? sort : 'newest',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

/** Build the URL query, leaving out defaults so links stay short. */
export function toBrowseQuery(state: PropertyBrowseState): LocationQueryRaw {
  const query: LocationQueryRaw = {}
  if (state.search.trim()) query.search = state.search.trim()
  if (state.propertyType !== ALL_TYPES) query.type = state.propertyType
  if (state.listingType !== ALL_LISTINGS) query.listing = state.listingType
  if (state.tags.length) query.tags = state.tags.join(',')
  if (state.minPrice !== null) query.min_price = String(state.minPrice)
  if (state.maxPrice !== null) query.max_price = String(state.maxPrice)
  if (state.sort !== 'newest') query.sort = state.sort
  if (state.page > 1) query.page = String(state.page)
  return query
}

/** Compare two queries ignoring key order, to avoid redundant router navigations. */
export function isSameQuery(a: LocationQueryRaw, b: LocationQueryRaw): boolean {
  const normalize = (query: LocationQueryRaw) =>
    JSON.stringify(Object.keys(query).sort().map((key) => [key, String(query[key])]))
  return normalize(a) === normalize(b)
}
