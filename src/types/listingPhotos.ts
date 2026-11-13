/** An already-uploaded listing photo, as shown in the edit form. */
export interface ListingPhoto {
  id: number
  url: string
  isPrimary: boolean
}

/** Edits to existing photos, sent with the listing update. */
export interface PhotoChanges {
  removeImageIds: number[]
  /** Remaining photo ids in display order. */
  imageOrder: number[]
  primaryImageId: number | null
}

export function initialPhotoChanges(photos: ListingPhoto[]): PhotoChanges {
  return {
    removeImageIds: [],
    imageOrder: photos.map((photo) => photo.id),
    primaryImageId: photos.find((photo) => photo.isPrimary)?.id ?? photos[0]?.id ?? null,
  }
}

/** True when the edits would change anything on the server. */
export function hasPhotoChanges(photos: ListingPhoto[], changes: PhotoChanges): boolean {
  const initial = initialPhotoChanges(photos)
  return changes.removeImageIds.length > 0
    || changes.primaryImageId !== initial.primaryImageId
    || changes.imageOrder.join(',') !== initial.imageOrder.join(',')
}

export function remainingPhotoCount(photos: ListingPhoto[], changes: PhotoChanges | null): number {
  return photos.length - (changes?.removeImageIds.length ?? 0)
}
