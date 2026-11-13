import { describe, expect, it } from 'vitest'
import { hasPhotoChanges, initialPhotoChanges, remainingPhotoCount } from '@/types/listingPhotos'
import { formatPricePerSqm } from '../format'

const photos = [
  { id: 1, url: 'a.jpg', isPrimary: false },
  { id: 2, url: 'b.jpg', isPrimary: true },
]

describe('listing photo changes', () => {
  it('starts from the current order and cover', () => {
    expect(initialPhotoChanges(photos)).toEqual({ removeImageIds: [], imageOrder: [1, 2], primaryImageId: 2 })
  })

  it('only reports real changes', () => {
    const initial = initialPhotoChanges(photos)
    expect(hasPhotoChanges(photos, initial)).toBe(false)
    expect(hasPhotoChanges(photos, { ...initial, primaryImageId: 1 })).toBe(true)
    expect(hasPhotoChanges(photos, { ...initial, imageOrder: [2, 1] })).toBe(true)
    expect(hasPhotoChanges(photos, { ...initial, removeImageIds: [1] })).toBe(true)
  })

  it('counts photos that will remain', () => {
    expect(remainingPhotoCount(photos, { removeImageIds: [1], imageOrder: [1, 2], primaryImageId: 2 })).toBe(1)
  })
})

describe('formatPricePerSqm', () => {
  it('rounds to whole pesos', () => {
    expect(formatPricePerSqm(38000, 120)).toBe('₱317 / sq. m.')
  })

  it('is empty when price or area is missing', () => {
    expect(formatPricePerSqm(0, 120)).toBe('')
    expect(formatPricePerSqm(38000, 0)).toBe('')
  })
})
