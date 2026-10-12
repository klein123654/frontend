import { ref } from 'vue'
import { fetchMyInquiries, updateInquiryStatus as persistInquiryStatus } from '@/services/inquiryService'
import type { InquiryStatus, OwnerInquiry } from '@/data/owner/ownerInquiries'

export const allOwnerInquiries = ref<OwnerInquiry[]>([])

export async function loadOwnerInquiries(): Promise<void> {
  const { data } = await fetchMyInquiries()
  allOwnerInquiries.value = data.map((item) => ({
    id: item.id, propertyId: item.property_id, customerName: item.name,
    customerEmail: item.email, customerPhone: item.phone ?? '',
    subject: item.property?.title ?? 'Property inquiry', message: item.message,
    contactPreference: 'Either',
    status: ({ new: 'New', in_progress: 'In Progress', resolved: 'Resolved' } as const)[item.status as 'new' | 'in_progress' | 'resolved'] ?? 'New',
    dateReceived: item.created_at.slice(0, 10),
  }))
}

export function getOwnerInquiry(id: number): OwnerInquiry | undefined {
  return allOwnerInquiries.value.find((item) => item.id === id)
}

export async function updateInquiryStatus(id: number, status: InquiryStatus): Promise<boolean> {
  try {
    await persistInquiryStatus(id, status.toLowerCase().replace(' ', '_'))
    const inquiry = getOwnerInquiry(id)
    if (inquiry) inquiry.status = status
    return Boolean(inquiry)
  } catch {
    return false
  }
}
