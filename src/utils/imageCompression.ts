export interface CompressionOptions {
  /** Longest edge in pixels after resizing. */
  maxDimension?: number
  /** WebP quality between 0 and 1. */
  quality?: number
}

/** Scale (width, height) down so the longest edge is at most maxDimension. */
export function fitWithin(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  return { width: Math.round(width * scale), height: Math.round(height * scale), scale }
}

/**
 * Resize a photo and re-encode it as WebP before upload, which typically cuts
 * phone photos from several megabytes to a few hundred kilobytes. Falls back
 * to the original file whenever the browser cannot do this or it would not help.
 */
export async function compressImage(
  file: File,
  { maxDimension = 1920, quality = 0.82 }: CompressionOptions = {},
): Promise<File> {
  const isCompressible = /^image\/(jpeg|png|webp)$/.test(file.type)
  if (!isCompressible || typeof createImageBitmap !== 'function' || typeof document === 'undefined') {
    return file
  }

  try {
    const bitmap = await createImageBitmap(file)
    const { width, height, scale } = fitWithin(bitmap.width, bitmap.height, maxDimension)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    // Browsers without WebP encoding return PNG; keep the original in that case.
    if (!blob || blob.type !== 'image/webp') return file
    if (scale === 1 && blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: file.lastModified })
  } catch {
    return file
  }
}
