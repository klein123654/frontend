export type BrokerInquiryStatus = 'New' | 'In Progress' | 'Closed'

export interface BrokerInquiry {
  id: number
  listingId: number
  customerName: string
  customerEmail: string
  subject: string
  message: string
  status: BrokerInquiryStatus
  dateReceived: string
}

export const brokerInquiries: BrokerInquiry[] = []
