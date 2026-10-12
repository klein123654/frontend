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

export interface BackendInquiry {
  id: number
  property_id: number
  buyer_id: number | null
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  created_at: string
  property?: { id: number; title: string; owner_id: number; broker_id: number | null }
}
