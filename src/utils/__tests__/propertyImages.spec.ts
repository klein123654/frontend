import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, validatePropertyImages } from '../propertyImages'

const photo = (type = 'image/jpeg', size = 1024) => ({ type, size })

describe('validatePropertyImages', () => {
  it('accepts up to five supported images', () => {
    expect(validatePropertyImages([photo(), photo('image/png'), photo('image/webp')])).toBe('')
  })

  it('rejects more than five images', () => {
    expect(validatePropertyImages(Array.from({ length: 6 }, () => photo()))).toMatch(/maximum of 5/)
  })

  it('rejects unsupported file types such as GIF', () => {
    expect(validatePropertyImages([photo('image/gif')])).toMatch(/JPG, PNG or WebP/)
  })

  it('rejects files over 5 MB', () => {
    expect(validatePropertyImages([photo('image/jpeg', MAX_IMAGE_BYTES + 1)])).toMatch(/5 MB/)
  })
})
