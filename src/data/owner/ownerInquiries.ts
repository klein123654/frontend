
import type { OwnerProperty } from './ownerProperties'

export type InquiryStatus = 'New' | 'In Progress' | 'Resolved'

export type InquiryContactPreference =
  | 'Email'
  | 'Phone'
  | 'Either'

export interface OwnerInquiry {
  id: number
  propertyId: OwnerProperty['id']
  customerName: string
  customerEmail: string
  customerPhone: string
  subject: string
  message: string
  aiSummary: string | null
  aiPriority: 'high' | 'medium' | 'low' | 'unscored'
  contactPreference: InquiryContactPreference
  status: InquiryStatus
  dateReceived: string
}

export const ownerInquiries: OwnerInquiry[] = []

export type TagSeverity = 'info' | 'warn' | 'success' | 'danger' | 'secondary'

export const INQUIRY_STATUSES: InquiryStatus[] = ['New', 'In Progress', 'Resolved']

/** PrimeVue Tag colour for an inquiry's workflow status. */
export function inquiryStatusSeverity(status: InquiryStatus): TagSeverity {
  switch (status) {
    case 'New':
      return 'info'
    case 'In Progress':
      return 'warn'
    case 'Resolved':
      return 'success'
    default:
      return 'secondary'
  }
}

/** PrimeVue Tag colour for the AI lead priority score. */
export function aiPrioritySeverity(priority: OwnerInquiry['aiPriority']): TagSeverity {
  switch (priority) {
    case 'high':
      return 'danger'
    case 'medium':
      return 'warn'
    case 'low':
      return 'info'
    default:
      return 'secondary'
  }
}

/** Count inquiries per status for the summary cards. */
export function countInquiriesByStatus(inquiries: Pick<OwnerInquiry, 'status'>[]): Record<InquiryStatus, number> {
  const counts: Record<InquiryStatus, number> = { New: 0, 'In Progress': 0, Resolved: 0 }
  for (const inquiry of inquiries) {
    if (inquiry.status in counts) counts[inquiry.status] += 1
  }
  return counts
}
