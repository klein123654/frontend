import type { ListingAvailability } from '@/types/property'

/** Colour tone shared by badges, map pins and legends. */
export type StatusTone = 'green' | 'amber' | 'red' | 'grey' | 'blue'

export interface StatusMeta {
  label: string
  tone: StatusTone
  /** Short explanation shown in legends and tooltips. */
  description: string
}

/** Pin / dot colours. Text always accompanies the colour, so it is never the only cue. */
export const TONE_COLORS: Record<StatusTone, { solid: string; background: string; text: string }> = {
  green: { solid: '#16a34a', background: '#dcfce7', text: '#166534' },
  amber: { solid: '#d97706', background: '#fef3c7', text: '#92400e' },
  red: { solid: '#dc2626', background: '#fee2e2', text: '#991b1b' },
  grey: { solid: '#64748b', background: '#f1f5f9', text: '#334155' },
  blue: { solid: '#2563eb', background: '#dbeafe', text: '#1e40af' },
}

export const AVAILABILITY_META: Record<ListingAvailability, StatusMeta> = {
  available: { label: 'Available', tone: 'green', description: 'Open for inquiries.' },
  reserved: { label: 'Reserved', tone: 'amber', description: 'Under negotiation. You can still inquire as a backup.' },
  rented: { label: 'Rented / Leased', tone: 'red', description: 'Already taken. Shown for 30 days, then removed.' },
  sold: { label: 'Sold', tone: 'grey', description: 'Already sold. Shown for 30 days, then removed.' },
}

export const AVAILABILITY_ORDER: ListingAvailability[] = ['available', 'reserved', 'rented', 'sold']

/** Rented and sold listings are shown but no longer accept inquiries. */
export function acceptsInquiries(availability: ListingAvailability | undefined): boolean {
  return availability !== 'rented' && availability !== 'sold'
}

/** Review statuses of a listing in the publisher and admin workspaces. */
export type ReviewStatusKey = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Needs confirmation'

export const REVIEW_STATUS_META: Record<ReviewStatusKey, StatusMeta> = {
  Draft: { label: 'Draft', tone: 'grey', description: 'Not yet submitted.' },
  Pending: { label: 'Pending review', tone: 'blue', description: 'Waiting for an administrator.' },
  Approved: { label: 'Published', tone: 'green', description: 'Approved and public.' },
  Rejected: { label: 'Rejected', tone: 'red', description: 'Needs changes before it can be published.' },
  'Needs confirmation': { label: 'Needs confirmation', tone: 'amber', description: 'Confirm it is still available within 60 days.' },
}

export function legendItems(meta: Record<string, StatusMeta>, order: string[] = Object.keys(meta)) {
  return order.map((key) => ({ key, ...meta[key]! }))
}
