export const MAX_PROPERTY_IMAGES = 5
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Check a selection of listing photos against the upload rules the API enforces.
 * Returns an error message, or an empty string when the selection is valid.
 */
export function validatePropertyImages(files: Pick<File, 'type' | 'size'>[]): string {
  if (files.length > MAX_PROPERTY_IMAGES) {
    return `Please select a maximum of ${MAX_PROPERTY_IMAGES} images.`
  }
  if (files.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
    return 'Only JPG, PNG or WebP files are allowed.'
  }
  if (files.some((file) => file.size > MAX_IMAGE_BYTES)) {
    return 'Each image must be 5 MB or smaller.'
  }
  return ''
}
