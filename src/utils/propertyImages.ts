/** Most photos one listing can have (the API enforces the same limit). */
export const MAX_PROPERTY_IMAGES = 10
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Check a selection of listing photos against the upload rules the API enforces.
 * Returns an error message, or an empty string when the selection is valid.
 */
export function validatePropertyImages(files: Pick<File, 'type' | 'size'>[], existingCount = 0): string {
  const room = photoRoom(existingCount)
  if (files.length > room) {
    return room === 0
      ? `A listing can have up to ${MAX_PROPERTY_IMAGES} photos. Remove a photo before adding another.`
      : `A listing can have up to ${MAX_PROPERTY_IMAGES} photos. You can add ${room} more.`
  }
  if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
    return 'Only JPG, PNG or WebP files are allowed.'
  }
  if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
    return 'Each image must be 5 MB or smaller.'
  }
  return ''
}

/** How many more photos fit on a listing that already has `existingCount`. */
export function photoRoom(existingCount = 0): number {
  return Math.max(0, MAX_PROPERTY_IMAGES - existingCount)
}
