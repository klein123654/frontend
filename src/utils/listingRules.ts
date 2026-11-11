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

/** Must match Property::REMIND_AFTER_DAYS and Property::HIDE_AFTER_DAYS in the backend. */
export const REMIND_AFTER_DAYS = 45
export const HIDE_AFTER_DAYS = 60

export type AvailabilityState = 'live' | 'needs-confirmation' | 'hidden-unconfirmed' | 'rented' | 'sold' | 'not-published'

const DAY_MS = 24 * 60 * 60 * 1000

/** Work out what the public currently sees for a listing, based on its availability. */
export function availabilityState(
  listing: { status: WorkspaceListingStatus; availability: 'available' | 'rented' | 'sold'; availabilityConfirmedAt: string | null },
  now: Date = new Date(),
): AvailabilityState {
  if (listing.availability === 'rented' || listing.availability === 'sold') return listing.availability
  if (listing.status !== 'Approved') return 'not-published'
  if (!listing.availabilityConfirmedAt) return 'live'
  const ageInDays = (now.getTime() - new Date(listing.availabilityConfirmedAt).getTime()) / DAY_MS
  if (ageInDays >= HIDE_AFTER_DAYS) return 'hidden-unconfirmed'
  if (ageInDays >= REMIND_AFTER_DAYS) return 'needs-confirmation'
  return 'live'
}

export const AVAILABILITY_MESSAGES: Record<AvailabilityState, string> = {
  live: 'Visible to the public.',
  'needs-confirmation': 'Please confirm this listing is still available. Unconfirmed listings are hidden after 60 days.',
  'hidden-unconfirmed': 'Hidden from the public because it hasn’t been confirmed in 60 days. Confirm it to show it again.',
  rented: 'Marked as rented and hidden from the public.',
  sold: 'Marked as sold and hidden from the public.',
  'not-published': 'Availability applies once the listing is approved.',
}
