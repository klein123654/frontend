export type BrokerInquiryStatus = 'New' | 'In Progress' | 'Closed'

export interface BrokerInquiry {
  id: number
  listingId: number
  customerName: string
  customerEmail: string
  subject: string
  message: string
  aiSummary: string | null
  aiPriority: 'high' | 'medium' | 'low' | 'unscored'
  status: BrokerInquiryStatus
  dateReceived: string
}

// Future Laravel API data will replace this empty frontend source.
export const brokerInquiries: BrokerInquiry[] = []
