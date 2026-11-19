import { apiRequest } from './api'
import type { BrokerCredentialMeta, BrokerCredentialRecord, BrokerVerificationRecord } from './brokerCredentials'

export async function submitBrokerVerification(input: BrokerCredentialRecord) {
  return apiRequest<{ message: string; data: BrokerVerificationRecord }>('broker/verification', { method: 'POST', body: JSON.stringify(input) })
}

export async function fetchBrokerVerification() {
  return apiRequest<{ data: BrokerVerificationRecord | null; meta?: BrokerCredentialMeta }>('broker/verification')
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
