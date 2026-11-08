import { apiRequest } from './api'

export interface InquiryInput {
  name: string
  email: string
  phone?: string
  message: string
}

export async function createInquiry(propertyId: number, input: InquiryInput) {
  return apiRequest<{ data: { id: number } }>(`properties/${propertyId}/inquiries`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function fetchMyInquiries() {
  return apiRequest<{ data: BackendInquiry[] }>('my/inquiries')
}

export async function fetchMySentInquiries() {
  return apiRequest<{ data: BackendInquiry[] }>('my/inquiries/sent')
}

export async function updateInquiryStatus(id: number, status: string) {
  return apiRequest<{ data: BackendInquiry }>(`inquiries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export interface InquiryThreadMessage {
  id: number
  inquiry_id: number
  sender_id: number | null
  body: string
  created_at: string
  sender: { id: number; name: string } | null
}

export async function fetchInquiryMessages(inquiryId: number) {
  return apiRequest<{ data: InquiryThreadMessage[] }>(`inquiries/${inquiryId}/messages`)
}

export async function sendInquiryMessage(inquiryId: number, body: string) {
  return apiRequest<{ data: InquiryThreadMessage }>(`inquiries/${inquiryId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

export interface BackendInquiry {
  id: number
  property_id: number
  buyer_id: number | null
  name: string
  email: string
  phone: string | null
  message: string
  ai_summary: string | null
  ai_priority: 'high' | 'medium' | 'low' | 'unscored'
  status: string
  created_at: string
  last_message_at?: string | null
  property?: { id: number; title: string; owner_id: number; broker_id: number | null }
}
