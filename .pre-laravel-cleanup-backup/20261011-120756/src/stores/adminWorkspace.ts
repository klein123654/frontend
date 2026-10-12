import { computed, ref } from 'vue'
import { allOwnerProperties } from '@/stores/ownerProperties'
import { allBrokerListings } from '@/stores/brokerListings'
import type {
  AdminDecision, AdminInquiry, BugReport, CaseState, ManagedUser,
  ReviewRecord, UserState, VerificationRequest, VerificationState
} from '@/data/admin/adminTypes'

// Frontend-only demo data. Nothing here authenticates or authorizes a real administrator.
// LocalStorage data is scoped to one browser, NOT shared between real users.
const KEYS = {
  reviews: 'butuanspaces-admin-reviews-v1',
  verifications: 'butuanspaces-admin-verifications-v1',
  users: 'butuanspaces-admin-users-v1',
  inquiries: 'butuanspaces-admin-inquiries-v1',
  reports: 'butuanspaces-admin-reports-v1'
} as const

function readList<T>(key: string, accept: (item: unknown) => item is T): T[] {
  try {
    const text = localStorage.getItem(key)
    const data: unknown = text ? JSON.parse(text) : []
    return Array.isArray(data) ? data.filter(accept) : []
  } catch { return [] }
}

function objectRow(item: unknown): item is Record<string, unknown> {
  return typeof item === 'object' && item !== null && !Array.isArray(item)
}
function validId(item: Record<string, unknown>): boolean {
  return typeof item.id === 'number' && Number.isSafeInteger(item.id) && item.id > 0
}
function validReview(item: unknown): item is ReviewRecord {
  return objectRow(item) && typeof item.key === 'string' &&
    (item.decision === 'Approved' || item.decision === 'Rejected') &&
    typeof item.reviewedAt === 'string' && typeof item.note === 'string'
}
function validVerification(item: unknown): item is VerificationRequest {
  return objectRow(item) && validId(item) && typeof item.name === 'string' &&
    typeof item.email === 'string' && typeof item.affiliation === 'string' &&
    typeof item.submittedAt === 'string' && typeof item.note === 'string' &&
    (item.status === 'Pending' || item.status === 'Verified' || item.status === 'Rejected')
}
function validUser(item: unknown): item is ManagedUser {
  return objectRow(item) && validId(item) && typeof item.name === 'string' &&
    typeof item.email === 'string' && typeof item.joinedAt === 'string' &&
    ['Client', 'Owner', 'Broker', 'Admin'].includes(String(item.role)) &&
    (item.status === 'Active' || item.status === 'Suspended')
}
function validCase(item: unknown): item is AdminInquiry {
  return objectRow(item) && validId(item) && typeof item.name === 'string' &&
    typeof item.email === 'string' && typeof item.subject === 'string' &&
    typeof item.message === 'string' && typeof item.createdAt === 'string' &&
    ['New', 'In Progress', 'Resolved'].includes(String(item.status))
}
function validReport(item: unknown): item is BugReport {
  return objectRow(item) && validId(item) && typeof item.name === 'string' &&
    typeof item.email === 'string' && typeof item.category === 'string' &&
    typeof item.title === 'string' && typeof item.description === 'string' &&
    typeof item.createdAt === 'string' &&
    ['New', 'In Progress', 'Resolved'].includes(String(item.status))
}

const reviews = ref<ReviewRecord[]>(readList(KEYS.reviews, validReview))
const verifications = ref<VerificationRequest[]>(readList(KEYS.verifications, validVerification))
const users = ref<ManagedUser[]>(readList(KEYS.users, validUser))
const inquiries = ref<AdminInquiry[]>(readList(KEYS.inquiries, validCase))
const reports = ref<BugReport[]>(readList(KEYS.reports, validReport))

function save<T>(key: string, records: T[]): boolean {
  try { localStorage.setItem(key, JSON.stringify(records)); return true }
  catch { return false }
}
function now(): string { return new Date().toISOString() }

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
}
export const adminListings = computed<AdminListing[]>(() => {
  const owner = allOwnerProperties.value.map((item) => ({
    key: `owner-${item.id}`, source: 'Owner' as const, id: item.id,
    title: item.title, location: item.location, barangay: item.barangay,
    price: item.price, dateCreated: item.dateCreated, sourceStatus: item.status
  }))
  const broker = allBrokerListings.value.map((item) => ({
    key: `broker-${item.id}`, source: 'Broker' as const, id: item.id,
    title: item.title, location: item.location, barangay: item.barangay,
    price: item.price, dateCreated: item.dateCreated, sourceStatus: item.status
  }))
  return [...owner, ...broker].map((item) => {
    const decision = reviews.value.find((record) => record.key === item.key)
    // Decisions here are Admin-only demo overlays; underlying owner/broker stores stay unchanged.
    const applicable = item.sourceStatus === 'Pending' ? decision : undefined
    return {
      ...item, status: applicable?.decision ?? item.sourceStatus,
      reviewNote: applicable?.note ?? ''
    }
  })
})
export const pendingAdminListings = computed(() => adminListings.value.filter((item) => item.status === 'Pending'))

export function reviewAdminListing(key: string, decision: AdminDecision, note: string): boolean {
  if (!pendingAdminListings.value.some((item) => item.key === key)) return false
  const updated: ReviewRecord[] = [
    ...reviews.value.filter((item) => item.key !== key),
    { key, decision, note: note.trim(), reviewedAt: now() }
  ]
  if (!save(KEYS.reviews, updated)) return false
  reviews.value = updated
  return true
}

export const adminVerifications = computed(() => verifications.value)
export function decideVerification(id: number, status: Exclude<VerificationState, 'Pending'>, note: string): boolean {
  if (!verifications.value.some((item) => item.id === id && item.status === 'Pending')) return false
  const updated = verifications.value.map((item) => item.id === id ? { ...item, status, note: note.trim() } : item)
  if (!save(KEYS.verifications, updated)) return false
  verifications.value = updated
  return true
}

export const adminUsers = computed(() => users.value)
export function setAdminUserStatus(id: number, status: UserState): boolean {
  if (!users.value.some((item) => item.id === id && item.role !== 'Admin')) return false
  const updated = users.value.map((item) => item.id === id ? { ...item, status } : item)
  if (!save(KEYS.users, updated)) return false
  users.value = updated
  return true
}

export const adminInquiries = computed(() => inquiries.value)
export function setAdminInquiryStatus(id: number, status: CaseState): boolean {
  if (!inquiries.value.some((item) => item.id === id)) return false
  const updated = inquiries.value.map((item) => item.id === id ? { ...item, status } : item)
  if (!save(KEYS.inquiries, updated)) return false
  inquiries.value = updated
  return true
}

export const adminReports = computed(() => reports.value)
export function submitBugReport(data: Pick<BugReport, 'name' | 'email' | 'category' | 'title' | 'description'>): boolean {
  if (!data.title.trim() || !data.description.trim()) return false
  const next = Math.max(0, ...reports.value.map((item) => item.id)) + 1
  const updated: BugReport[] = [
    ...reports.value,
    { ...data, id: next, status: 'New', createdAt: now() }
  ]
  if (!save(KEYS.reports, updated)) return false
  reports.value = updated
  return true
}
export function setAdminReportStatus(id: number, status: CaseState): boolean {
  if (!reports.value.some((item) => item.id === id)) return false
  const updated = reports.value.map((item) => item.id === id ? { ...item, status } : item)
  if (!save(KEYS.reports, updated)) return false
  reports.value = updated
  return true
}
