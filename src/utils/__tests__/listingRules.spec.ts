import { describe, expect, it } from 'vitest'
import { availabilityState, deleteListingConfirmation, editRequiresReview } from '../listingRules'

describe('listing edit and delete rules', () => {
  it('requires review when editing pending or approved listings', () => {
    expect(editRequiresReview('Approved')).toBe(true)
    expect(editRequiresReview('Pending')).toBe(true)
    expect(editRequiresReview('Draft')).toBe(false)
    expect(editRequiresReview('Rejected')).toBe(false)
  })

  it('warns that deleting a live listing removes it from the public site', () => {
    expect(deleteListingConfirmation('Corner Lot', 'Approved')).toMatch(/live and will be removed from the public site/)
    expect(deleteListingConfirmation('Corner Lot', 'Draft')).not.toMatch(/live/)
    expect(deleteListingConfirmation('Corner Lot', 'Draft')).toContain('"Corner Lot"')
  })
})

describe('availabilityState', () => {
  const now = new Date('2026-11-12T00:00:00Z')
  const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()

  it('treats recently confirmed approved listings as live', () => {
    expect(availabilityState({ status: 'Approved', availability: 'available', availabilityConfirmedAt: daysAgo(3) }, now)).toBe('live')
  })

  it('asks for confirmation after 45 days and hides after 60', () => {
    expect(availabilityState({ status: 'Approved', availability: 'available', availabilityConfirmedAt: daysAgo(46) }, now)).toBe('needs-confirmation')
    expect(availabilityState({ status: 'Approved', availability: 'available', availabilityConfirmedAt: daysAgo(61) }, now)).toBe('hidden-unconfirmed')
  })

  it('reports rented and sold listings regardless of age', () => {
    expect(availabilityState({ status: 'Approved', availability: 'rented', availabilityConfirmedAt: daysAgo(1) }, now)).toBe('rented')
    expect(availabilityState({ status: 'Draft', availability: 'sold', availabilityConfirmedAt: null }, now)).toBe('sold')
  })

  it('does not apply to listings that are not approved yet', () => {
    expect(availabilityState({ status: 'Pending', availability: 'available', availabilityConfirmedAt: daysAgo(90) }, now)).toBe('not-published')
  })
})
