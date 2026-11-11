import { describe, expect, it } from 'vitest'
import { compressImage, fitWithin } from '../imageCompression'

describe('fitWithin', () => {
  it('scales the longest edge down to the limit', () => {
    expect(fitWithin(4000, 3000, 1920)).toEqual({ width: 1920, height: 1440, scale: 0.48 })
  })

  it('never upscales small images', () => {
    expect(fitWithin(800, 600, 1920)).toEqual({ width: 800, height: 600, scale: 1 })
  })
})

describe('compressImage', () => {
  it('returns the original file when the browser cannot decode images', async () => {
    const file = new File(['bytes'], 'office.png', { type: 'image/png' })

    await expect(compressImage(file)).resolves.toBe(file)
  })

  it('leaves unsupported types untouched', async () => {
    const file = new File(['bytes'], 'animation.gif', { type: 'image/gif' })

    await expect(compressImage(file)).resolves.toBe(file)
  })
})
