import { describe, expect, it } from 'vitest'
import { deleteListingConfirmation, editRequiresReview } from '../listingRules'

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
