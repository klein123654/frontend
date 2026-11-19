import type { CredentialStatus } from '@/types/property'

/** Broker credentials and firm details as the API sends and accepts them. */
export interface BrokerCredentialRecord {
  license_number: string | null
  prc_valid_until: string | null
  dhsud_registration_number: string | null
  dhsud_valid_until: string | null
  firm_name: string | null
  firm_position: string | null
  firm_address: string | null
  firm_registration_number: string | null
  affiliations: string[] | null
}

export interface BrokerVerificationRecord extends BrokerCredentialRecord {
  id: number
  status: 'pending' | 'verified' | 'rejected'
  review_notes: string | null
  credential_status: CredentialStatus
  dhsud_check_due: boolean
  dhsud_checked_at: string | null
  created_at: string
  updated_at?: string
}

/** Extra details the API returns next to an application or verification. */
export interface BrokerCredentialMeta {
  dhsud_notice: string
  suggested_affiliations: string[]
}

export const DEFAULT_DHSUD_NOTICE =
  'ButuanSpaces checks with DHSUD every year whether your broker registration is still active. Keep your DHSUD registration current; listings cannot be added while it is expired.'

export const DEFAULT_AFFILIATIONS = [
  'Butuan Realty Board',
  'Philippine Association of Real Estate Boards (PAREB)',
  'Real Estate Brokers Association of the Philippines (REBAP)',
  'National Real Estate Association (NREA)',
]

/** The form's editable copy of a broker's credentials. */
export interface BrokerCredentialForm {
  licenseNumber: string
  prcValidUntil: string
  dhsudRegistrationNumber: string
  dhsudValidUntil: string
  firmName: string
  firmPosition: string
  firmAddress: string
  firmRegistrationNumber: string
  affiliations: string[]
}

export function emptyCredentialForm(): BrokerCredentialForm {
  return {
    licenseNumber: '', prcValidUntil: '', dhsudRegistrationNumber: '', dhsudValidUntil: '',
    firmName: '', firmPosition: '', firmAddress: '', firmRegistrationNumber: '', affiliations: [],
  }
}

export function credentialFormFrom(record: Partial<BrokerCredentialRecord> | null | undefined): BrokerCredentialForm {
  return {
    licenseNumber: record?.license_number ?? '',
    prcValidUntil: record?.prc_valid_until?.slice(0, 10) ?? '',
    dhsudRegistrationNumber: record?.dhsud_registration_number ?? '',
    dhsudValidUntil: record?.dhsud_valid_until?.slice(0, 10) ?? '',
    firmName: record?.firm_name ?? '',
    firmPosition: record?.firm_position ?? '',
    firmAddress: record?.firm_address ?? '',
    firmRegistrationNumber: record?.firm_registration_number ?? '',
    affiliations: [...(record?.affiliations ?? [])],
  }
}

export function credentialPayload(form: BrokerCredentialForm): BrokerCredentialRecord {
  const optional = (value: string) => value.trim() || null
  return {
    license_number: form.licenseNumber.trim(),
    prc_valid_until: form.prcValidUntil,
    dhsud_registration_number: form.dhsudRegistrationNumber.trim(),
    dhsud_valid_until: form.dhsudValidUntil,
    firm_name: form.firmName.trim(),
    firm_position: optional(form.firmPosition),
    firm_address: optional(form.firmAddress),
    firm_registration_number: optional(form.firmRegistrationNumber),
    affiliations: [...new Set(form.affiliations.map((name) => name.trim()).filter(Boolean))],
  }
}

export const CREDENTIAL_STATUS_TEXT: Record<CredentialStatus, string> = {
  current: 'Both credentials are valid.',
  expiring: 'A credential expires within 30 days. Renew it and submit the new validity date.',
  expired: 'Your PRC license or DHSUD registration has expired. Submit your renewed details to manage listings again.',
  missing: 'Add your PRC license and DHSUD registration validity dates to keep managing listings.',
}
