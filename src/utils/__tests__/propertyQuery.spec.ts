import { describe, expect, it } from 'vitest'
import { isSameQuery, parseBrowseQuery, toBrowseQuery } from '../propertyQuery'

describe('parseBrowseQuery', () => {
  it('returns defaults for an empty query', () => {
    expect(parseBrowseQuery({})).toEqual({
      search: '',
      propertyType: 'All Types',
      listingType: 'All Listings',
      barangay: '',
      tags: [],
      minPrice: null,
      maxPrice: null,
      sort: 'newest',
      page: 1,
    })
  })

  it('reads every filter from the URL', () => {
    const state = parseBrowseQuery({
      search: 'warehouse',
      type: 'Warehouses',
      listing: 'For Rent',
      tags: 'near port, corner lot',
      min_price: '10000',
      max_price: '50000',
      sort: 'price_asc',
      page: '3',
    })

    expect(state).toMatchObject({
      search: 'warehouse',
      propertyType: 'Warehouses',
      listingType: 'For Rent',
      tags: ['near port', 'corner lot'],
      minPrice: 10000,
      maxPrice: 50000,
      sort: 'price_asc',
      page: 3,
    })
  })

  it('ignores invalid sort, price and page values', () => {
    const state = parseBrowseQuery({ sort: 'random', min_price: '-5', max_price: 'abc', page: '0' })

    expect(state.sort).toBe('newest')
    expect(state.minPrice).toBeNull()
    expect(state.maxPrice).toBeNull()
    expect(state.page).toBe(1)
  })
})

describe('toBrowseQuery', () => {
  it('omits default values to keep links short', () => {
    expect(toBrowseQuery(parseBrowseQuery({}))).toEqual({})
  })

  it('round-trips through parseBrowseQuery', () => {
    const query = { search: 'office', type: 'Office Spaces', barangay: 'Libertad', tags: 'flood-free', min_price: '5000', sort: 'price_desc', page: '2' }

    expect(toBrowseQuery(parseBrowseQuery(query))).toEqual(query)
  })
})

describe('isSameQuery', () => {
  it('ignores key order', () => {
    expect(isSameQuery({ a: '1', b: '2' }, { b: '2', a: '1' })).toBe(true)
  })

  it('detects different values', () => {
    expect(isSameQuery({ page: '2' }, { page: '3' })).toBe(false)
  })
})
