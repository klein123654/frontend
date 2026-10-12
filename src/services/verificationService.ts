import { apiRequest } from './api'

export async function submitBrokerVerification(input: { license_number: string; agency_name?: string }) {
  return apiRequest('broker/verification', { method: 'POST', body: JSON.stringify(input) })
}

export async function fetchBrokerVerification() {
  return apiRequest<{ data: { status: string; license_number: string | null; agency_name: string | null; review_notes: string | null } | null }>('broker/verification')
}

export async function submitIssueReport(input: {
  name?: string
  email?: string
  category: string
  title: string
  description: string
}) {
  return apiRequest('reports', { method: 'POST', body: JSON.stringify(input) })
}
