import { describe, expect, it } from 'vitest'
import { browseQueryFromFilters, describeFilters, filtersFromBrowseState, hasSavableFilters } from '../savedSearch'
import { parseBrowseQuery } from '../propertyQuery'

describe('saved search helpers', () => {
  it('keeps only savable filters and maps the listing type to the API value', () => {
    const state = parseBrowseQuery({ type: 'Warehouses', listing: 'For Lease', barangay: 'Bancasi', max_price: '100000', tags: 'near port', sort: 'price_asc' })
    expect(filtersFromBrowseState(state)).toEqual({
      property_type: 'Warehouses',
      listing_type: 'lease',
      barangay: 'Bancasi',
      max_price: 100000,
    })
  })

  it('treats the default browse state as nothing to save', () => {
    expect(hasSavableFilters(filtersFromBrowseState(parseBrowseQuery({})))).toBe(false)
  })

  it('round-trips filters back into a browse URL', () => {
    const query = browseQueryFromFilters({ property_type: 'Office Spaces', listing_type: 'rent', min_price: 20000 })
    const state = parseBrowseQuery(query as Record<string, string>)
    expect(state.propertyType).toBe('Office Spaces')
    expect(state.listingType).toBe('For Rent')
    expect(state.minPrice).toBe(20000)
  })

  it('describes a search in plain words', () => {
    expect(describeFilters({ property_type: 'Warehouses', listing_type: 'rent', barangay: 'Bancasi', max_price: 100000 }))
      .toBe('Warehouses for rent in Bancasi under ₱100,000')
    expect(describeFilters({ search: 'corner' })).toBe('Commercial spaces matching “corner”')
  })
})
