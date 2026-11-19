import type { ListingAvailability } from '@/types/property'

/** Listing statuses as shown in the publisher workspaces. */
export type WorkspaceListingStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected'

export const REVIEW_ON_EDIT_NOTICE =
  'Saving changes sends this listing back to an administrator for review. It will be hidden from the public until it is approved again.'

/** Editing a submitted or live listing sends it back to review. */
export function editRequiresReview(status: WorkspaceListingStatus): boolean {
  return status === 'Pending' || status === 'Approved'
}

/** Confirmation text for deleting one of your own listings. */
export function deleteListingConfirmation(title: string, status: WorkspaceListingStatus): string {
  const consequences = status === 'Approved'
    ? 'It is live and will be removed from the public site, together with its inquiries and messages.'
    : 'Its inquiries and messages will also be deleted.'
  return `Delete "${title}"? ${consequences} This cannot be undone.`
}

/** Must match Property::REMIND_AFTER_DAYS, HIDE_AFTER_DAYS and UNAVAILABLE_VISIBLE_DAYS in the backend. */
export const REMIND_AFTER_DAYS = 45
export const HIDE_AFTER_DAYS = 60
export const UNAVAILABLE_VISIBLE_DAYS = 30

export type AvailabilityState =
  | 'live'
  | 'reserved'
  | 'needs-confirmation'
  | 'hidden-unconfirmed'
  | 'rented'
  | 'sold'
  | 'closed-hidden'
  | 'not-published'

const DAY_MS = 24 * 60 * 60 * 1000

/** Work out what the public currently sees for a listing, based on its availability. */
export function availabilityState(
  listing: { status: WorkspaceListingStatus; availability: ListingAvailability; availabilityConfirmedAt: string | null },
  now: Date = new Date(),
): AvailabilityState {
  const ageInDays = listing.availabilityConfirmedAt
    ? (now.getTime() - new Date(listing.availabilityConfirmedAt).getTime()) / DAY_MS
    : 0

  if (listing.availability === 'rented' || listing.availability === 'sold') {
    return listing.status === 'Approved' && ageInDays >= UNAVAILABLE_VISIBLE_DAYS ? 'closed-hidden' : listing.availability
  }
  if (listing.status !== 'Approved') return 'not-published'
  if (ageInDays >= HIDE_AFTER_DAYS) return 'hidden-unconfirmed'
  if (ageInDays >= REMIND_AFTER_DAYS) return 'needs-confirmation'
  return listing.availability === 'reserved' ? 'reserved' : 'live'
}

export const AVAILABILITY_MESSAGES: Record<AvailabilityState, string> = {
  live: 'Visible to the public as available.',
  reserved: 'Visible to the public as reserved. Buyers can still send inquiries.',
  'needs-confirmation': 'Please confirm this listing is still available. Unconfirmed listings are hidden after 60 days.',
  'hidden-unconfirmed': 'Hidden from the public because it hasn’t been confirmed in 60 days. Confirm it to show it again.',
  rented: 'Marked as rented. The public sees it as unavailable for 30 days, then it is hidden. It no longer receives inquiries.',
  sold: 'Marked as sold. The public sees it as unavailable for 30 days, then it is hidden. It no longer receives inquiries.',
  'closed-hidden': 'Rented or sold more than 30 days ago, so it is no longer shown to the public.',
  'not-published': 'Availability applies once the listing is approved.',
}
