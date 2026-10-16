export type AdminDecision = 'Approved' | 'Rejected'
export type ReviewState = 'Pending' | AdminDecision
export type VerificationState = 'Pending' | 'Verified' | 'Rejected'
export type UserRole = 'Client' | 'Owner' | 'Broker' | 'Admin'
export type UserState = 'Active' | 'Suspended'
export type CaseState = 'New' | 'In Progress' | 'Resolved'

export interface ReviewRecord {
  key: string
  decision: AdminDecision
  reviewedAt: string
  note: string
}

export interface AdminListing {
  key: string
  source: 'Owner' | 'Broker'
  id: number
  title: string
  location: string
  barangay: string
  price: number
  dateCreated: string
  sourceStatus: string
  status: string
  reviewNote: string
  images: { url: string; alt: string }[]
}

export interface VerificationRequest {
  id: number
  name: string
  email: string
  affiliation: string
  licenseNumber: string
  submittedAt: string
  status: VerificationState
  note: string
}

export interface ManagedUser {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserState
  joinedAt: string
}

export interface AdminInquiry {
  id: number
  name: string
  email: string
  subject: string
  message: string
  createdAt: string
  status: CaseState
}

export interface BugReport {
  id: number
  name: string
  email: string
  category: string
  title: string
  description: string
  createdAt: string
  status: CaseState
}
