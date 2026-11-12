import { describe, expect, it } from 'vitest'
import { formatArea, formatPeso } from '../format'

describe('formatPeso', () => {
  it('formats whole pesos with a thousands separator and no centavos', () => {
    expect(formatPeso(1500000)).toBe('₱1,500,000')
  })

  it('rounds fractional amounts', () => {
    expect(formatPeso(999.6)).toBe('₱1,000')
  })
})

describe('formatArea', () => {
  it('appends square metres', () => {
    expect(formatArea(1250)).toBe('1,250 sq. m.')
  })
})
