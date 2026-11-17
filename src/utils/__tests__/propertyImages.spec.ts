import { describe, expect, it } from 'vitest'
import { MAX_IMAGE_BYTES, photoRoom, validatePropertyImages } from '../propertyImages'

const photo = (type = 'image/jpeg', size = 1024) => ({ type, size })

describe('validatePropertyImages', () => {
  it('accepts up to five supported images', () => {
    expect(validatePropertyImages([photo(), photo('image/png'), photo('image/webp')])).toBe('')
  })

  it('limits a listing to ten photos in total', () => {
    expect(validatePropertyImages(Array.from({ length: 11 }, () => photo()))).toMatch(/up to 10 photos/)
    expect(validatePropertyImages(Array.from({ length: 10 }, () => photo()))).toBe('')
    expect(validatePropertyImages([photo(), photo()], 9)).toBe('A listing can have up to 10 photos. You can add 1 more.')
    expect(validatePropertyImages([photo()], 10)).toMatch(/Remove a photo/)
    expect(photoRoom(4)).toBe(6)
  })

  it('rejects unsupported file types such as GIF', () => {
    expect(validatePropertyImages([photo('image/gif')])).toMatch(/JPG, PNG or WebP/)
  })

  it('rejects files over 5 MB', () => {
    expect(validatePropertyImages([photo('image/jpeg', MAX_IMAGE_BYTES + 1)])).toMatch(/5 MB/)
  })
})
