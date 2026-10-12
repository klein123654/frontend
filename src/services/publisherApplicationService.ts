import { apiRequest } from './api'

export type PublisherRole = 'owner' | 'broker' | 'developer'
export type PublisherApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface PublisherApplication {
  id: number
  requested_role: PublisherRole
  ownership_type: string | null
  business_name: string | null
  license_number: string | null
  agency_name: string | null
  status: PublisherApplicationStatus
  review_notes: string | null
  created_at: string
}

export interface PublisherApplicationInput {
  requested_role: PublisherRole
  ownership_type?: string
  business_name?: string
  license_number?: string
  agency_name?: string
}

export function fetchPublisherApplication() {
  return apiRequest<{ data: PublisherApplication | null }>('my/publisher-application')
}

export function submitPublisherApplication(input: PublisherApplicationInput) {
  return apiRequest<{ data: PublisherApplication }>('my/publisher-application', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
