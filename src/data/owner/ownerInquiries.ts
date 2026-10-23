
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
