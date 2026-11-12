import { describe, expect, it } from 'vitest'
import { routeNeedsPrimeVue } from '../primevue'

describe('routeNeedsPrimeVue', () => {
  it('skips PrimeVue on storefront pages', () => {
    expect(routeNeedsPrimeVue({ name: 'home' })).toBe(false)
    expect(routeNeedsPrimeVue({ name: 'properties' })).toBe(false)
  })

  it('loads PrimeVue for pages with forms and tables, and for unknown routes', () => {
    expect(routeNeedsPrimeVue({ name: 'property-details' })).toBe(true)
    expect(routeNeedsPrimeVue({ name: 'owner-properties' })).toBe(true)
    expect(routeNeedsPrimeVue({ name: undefined })).toBe(true)
  })
})
