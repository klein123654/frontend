import { ref } from 'vue'
import { fetchMyInquiries, updateInquiryStatus as persistInquiryStatus } from '@/services/inquiryService'
import type { BrokerInquiry, BrokerInquiryStatus } from '@/data/broker/brokerInquiries'

export const allBrokerInquiries = ref<BrokerInquiry[]>([])

export async function loadBrokerInquiries(): Promise<void> {
  const { data } = await fetchMyInquiries()
  allBrokerInquiries.value = data.map((item) => ({
    id: item.id, listingId: item.property_id, customerName: item.name,
    customerEmail: item.email, subject: item.property?.title ?? 'Property inquiry',
    message: item.message,
    status: ({ new: 'New', in_progress: 'In Progress', resolved: 'Closed' } as const)[item.status as 'new' | 'in_progress' | 'resolved'] ?? 'New',
    dateReceived: item.created_at.slice(0, 10),
  }))
}

export async function updateBrokerInquiryStatus(id: number, status: BrokerInquiryStatus): Promise<boolean> {
  try {
    await persistInquiryStatus(id, status === 'Closed' ? 'resolved' : status.toLowerCase().replace(' ', '_'))
    const item = allBrokerInquiries.value.find((row) => row.id === id)
    if (item) item.status = status
    return Boolean(item)
  } catch {
    return false
  }
}
