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
