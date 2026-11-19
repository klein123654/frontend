import { apiRequest } from './api'
import type { BrokerCredentialMeta, BrokerCredentialRecord } from './brokerCredentials'

export type PublisherRole = 'owner' | 'broker'
export type PublisherApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface PublisherApplication extends BrokerCredentialRecord {
  id: number
  requested_role: PublisherRole
  ownership_type: string | null
  business_name: string | null
  status: PublisherApplicationStatus
  review_notes: string | null
  created_at: string
}

export interface PublisherApplicationInput extends Partial<BrokerCredentialRecord> {
  requested_role: PublisherRole
  ownership_type?: string
  business_name?: string | null
}

export function fetchPublisherApplication() {
  return apiRequest<{ data: PublisherApplication | null; meta?: BrokerCredentialMeta }>('my/publisher-application')
}

export function submitPublisherApplication(input: PublisherApplicationInput) {
  return apiRequest<{ data: PublisherApplication }>('my/publisher-application', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
