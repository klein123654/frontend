import { apiRequest } from './api'

export interface AdminPropertyRecord {
  id: number
  title: string
  status: string
  price: number | string
  address_line: string
  barangay: string | null
  city: string
  province: string
  created_at: string
  review_notes?: string | null
  owner?: { name: string; email: string }
  broker?: { name: string; email: string } | null
}
export interface AdminUserRecord {
  id: number; name: string; email: string; role: string; account_status: string; created_at: string
}
export interface AdminVerificationRecord {
  id: number; license_number: string | null; agency_name: string | null; status: string; review_notes: string | null; created_at: string
  broker?: { id: number; name: string; email: string }
}
export interface AdminInquiryRecord {
  id: number; name: string; email: string; message: string; status: string; created_at: string; property?: { title: string }
}
export interface AdminReportRecord {
  id: number; reason: string; details: string | null; status: string; reporter_name: string | null; reporter_email: string | null; created_at: string
}
export interface AdminPublisherApplication {
  id: number
  requested_role: 'owner' | 'broker' | 'developer'
  ownership_type: string | null
  business_name: string | null
  license_number: string | null
  agency_name: string | null
  status: 'pending' | 'approved' | 'rejected'
  review_notes: string | null
  created_at: string
  applicant: { id: number; name: string; email: string; phone: string | null; role: string }
}

async function list<T>(path: string): Promise<T[]> {
  const response = await apiRequest<{ data: T[] }>(path)
  return response.data
}
export const fetchAdminProperties = () => list<AdminPropertyRecord>('admin/properties')
export const fetchAdminUsers = () => list<AdminUserRecord>('admin/users')
export const fetchAdminVerifications = () => list<AdminVerificationRecord>('admin/verifications')
export const fetchAdminInquiries = () => list<AdminInquiryRecord>('admin/inquiries')
export const fetchAdminReports = () => list<AdminReportRecord>('admin/reports')
export const fetchAdminPublisherApplications = () => list<AdminPublisherApplication>('admin/publisher-applications')
export const fetchAdminSummary = () => apiRequest<{ data: Record<string, number> }>('admin/dashboard')

export function reviewProperty(id: number, status: 'published' | 'rejected', review_notes = '') {
  return apiRequest(`admin/properties/${id}`, { method: 'PATCH', body: JSON.stringify({ status, review_notes }) })
}
export function unpublishAdminProperty(id: number, review_notes: string) {
  return apiRequest(`admin/properties/${id}/unpublish`, {
    method: 'PATCH',
    body: JSON.stringify({ review_notes }),
  })
}
export function setUserAccountStatus(id: number, account_status: 'active' | 'suspended') {
  return apiRequest(`admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ account_status }) })
}
export function reviewBroker(id: number, status: 'verified' | 'rejected', review_notes = '') {
  return apiRequest(`admin/verifications/${id}`, { method: 'PATCH', body: JSON.stringify({ status, review_notes }) })
}
export function reviewPublisherApplication(id: number, status: 'approved' | 'rejected', review_notes = '') {
  return apiRequest<{ data: AdminPublisherApplication }>(`admin/publisher-applications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status, review_notes }),
  })
}
export function setReportStatus(id: number, status: 'open' | 'in_progress' | 'resolved', resolution_notes = '') {
  return apiRequest(`admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, resolution_notes }) })
}
