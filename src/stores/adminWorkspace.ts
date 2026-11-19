import { computed, ref } from 'vue'
import type { AdminInquiry, AdminListing, BugReport, ManagedUser, VerificationRequest } from '@/data/admin/adminTypes'
import { updateInquiryStatus } from '@/services/inquiryService'
import {
  fetchAdminInquiries, fetchAdminProperties, fetchAdminReports, fetchAdminSummary,
  fetchAdminUsers, fetchAdminVerifications, recordDhsudCheck, resolveAdminImageUrl, reviewBroker, reviewProperty,
  setReportStatus, setUserAccountStatus, unpublishAdminProperty, deleteAdminProperty, deleteUserAccount, type AdminVerificationRecord, type DeleteUserInput } from '@/services/adminService'

const properties = ref<AdminListing[]>([])
const verifications = ref<VerificationRequest[]>([])
const users = ref<ManagedUser[]>([])
const inquiries = ref<AdminInquiry[]>([])
const reports = ref<BugReport[]>([])
export const adminSummary = ref<Record<string, number>>({})
export const adminLoading = ref(false)
export const adminError = ref('')

const statuses: Record<string, string> = { draft: 'Draft', pending: 'Pending', published: 'Approved', rejected: 'Rejected', active: 'Active', suspended: 'Suspended', verified: 'Verified', new: 'New', open: 'New', in_progress: 'In Progress', resolved: 'Resolved' }
const titleCase = (value: string) => statuses[value] ?? value
const roleLabels: Record<string, ManagedUser['role']> = { buyer: 'Client', owner: 'Owner', broker: 'Broker', admin: 'Admin' }

export const adminListings = computed(() => properties.value)
export const pendingAdminListings = computed(() => properties.value.filter((item) => item.status === 'Pending'))
export const adminVerifications = computed(() => verifications.value)
export const adminUsers = computed(() => users.value)
export const adminInquiries = computed(() => inquiries.value)
export const adminReports = computed(() => reports.value)

export async function loadAdminWorkspace(): Promise<void> {
  adminLoading.value = true
  adminError.value = ''
  try {
    const [propertyRows, verificationRows, userRows, inquiryRows, reportRows, summary] = await Promise.all([
      fetchAdminProperties(), fetchAdminVerifications(), fetchAdminUsers(),
      fetchAdminInquiries(), fetchAdminReports(), fetchAdminSummary(),
    ])
    properties.value = propertyRows.map((item) => {
      const source = item.broker ? 'Broker' as const : 'Owner' as const
      return {
        key: `${source.toLowerCase()}-${item.id}`, source, id: item.id,
        title: item.title, location: [item.address_line, item.city, item.province].filter(Boolean).join(', '),
        barangay: item.barangay ?? '', price: Number(item.price), dateCreated: item.created_at.slice(0, 10),
        sourceStatus: titleCase(item.status), status: titleCase(item.status), reviewNote: item.review_notes ?? '',
        availability: item.availability ?? 'available', availabilityConfirmedAt: item.availability_confirmed_at ?? null,
        images: [...(item.images ?? [])]
          .sort((left, right) => Number(Boolean(right.is_primary)) - Number(Boolean(left.is_primary)) || (left.sort_order ?? 0) - (right.sort_order ?? 0))
          .map((image) => ({ url: resolveAdminImageUrl(image.path), alt: image.alt_text || item.title })),
      }
    })
    verifications.value = verificationRows.map(mapVerification)
    users.value = userRows.map((item) => ({
      id: item.id, name: item.name, email: item.email,
      role: roleLabels[item.role] ?? 'Client',
      status: titleCase(item.account_status) as ManagedUser['status'], joinedAt: item.created_at.slice(0, 10),
    }))
    inquiries.value = inquiryRows.map((item) => ({
      id: item.id, name: item.name, email: item.email, subject: item.property?.title ?? 'Property inquiry',
      message: item.message, createdAt: item.created_at, status: titleCase(item.status) as AdminInquiry['status'],
    }))
    reports.value = reportRows.map((item) => {
      const [rawCategory, ...titleParts] = item.reason.split(':')
      const category = rawCategory || 'Other'
      return {
        id: item.id, name: item.reporter_name ?? '', email: item.reporter_email ?? '', category,
        title: titleParts.join(':').trim() || category, description: item.details ?? '',
        createdAt: item.created_at, status: titleCase(item.status) as BugReport['status'],
      }
    })
    adminSummary.value = summary.data
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Unable to load administrator data.'
  } finally {
    adminLoading.value = false
  }
}

export async function reviewAdminListing(key: string, decision: 'Approved' | 'Rejected', note: string): Promise<boolean> {
  const item = properties.value.find((row) => row.key === key && row.status === 'Pending')
  if (!item) return false
  try {
    await reviewProperty(item.id, decision === 'Approved' ? 'published' : 'rejected', note)
    item.status = decision
    item.sourceStatus = decision
    item.reviewNote = note
    return true
  } catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to review listing.'; return false }
}

/** Permanently delete any listing (e.g. spam or test data). */
export async function deleteAdminListing(key: string, reason: string): Promise<boolean> {
  const item = properties.value.find((row) => row.key === key)
  if (!item) return false
  try {
    await deleteAdminProperty(item.id, reason.trim())
    properties.value = properties.value.filter((row) => row.key !== key)
    return true
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Unable to delete listing.'
    return false
  }
}

export async function unpublishAdminListing(key: string, note: string): Promise<boolean> {
  const item = properties.value.find((row) => row.key === key && row.status === 'Approved')
  if (!item || !note.trim()) return false
  try {
    await unpublishAdminProperty(item.id, note.trim())
    item.status = 'Draft'
    item.sourceStatus = 'Draft'
    item.reviewNote = note.trim()
    return true
  } catch (error) {
    adminError.value = error instanceof Error ? error.message : 'Unable to unpublish listing.'
    return false
  }
}

function mapVerification(item: AdminVerificationRecord): VerificationRequest {
  return {
    id: item.id, name: item.broker?.name ?? 'Broker', email: item.broker?.email ?? '',
    affiliation: item.firm_name ?? '', licenseNumber: item.license_number ?? '',
    submittedAt: (item.updated_at ?? item.created_at).slice(0, 10),
    status: titleCase(item.status) as VerificationRequest['status'], note: item.review_notes ?? '',
    record: item,
  }
}

function replaceVerification(record: AdminVerificationRecord) {
  const index = verifications.value.findIndex((row) => row.id === record.id)
  if (index >= 0) verifications.value[index] = mapVerification(record)
}

export async function decideVerification(id: number, status: 'Verified' | 'Rejected', note: string): Promise<boolean> {
  const item = verifications.value.find((row) => row.id === id && row.status === 'Pending')
  if (!item) return false
  try {
    const response = await reviewBroker(id, status.toLowerCase() as 'verified' | 'rejected', note)
    replaceVerification(response.data)
    return true
  } catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to review broker.'; return false }
}

/** Record the yearly check that a verified broker's DHSUD registration is still active. */
export async function recordAdminDhsudCheck(id: number, result: 'active' | 'inactive', note: string): Promise<boolean> {
  try {
    const response = await recordDhsudCheck(id, result, note)
    replaceVerification(response.data)
    return true
  } catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to record the DHSUD check.'; return false }
}

export async function setAdminUserStatus(id: number, status: 'Active' | 'Suspended'): Promise<boolean> {
  if (!users.value.some((item) => item.id === id && item.role !== 'Admin')) return false
  try { await setUserAccountStatus(id, status.toLowerCase() as 'active' | 'suspended'); const item = users.value.find((row) => row.id === id); if (item) item.status = status; return true }
  catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to update account.'; return false }
}

/** Permanently delete a non-admin account. Throws with a readable message on failure. */
export async function deleteAdminUser(id: number, input: DeleteUserInput): Promise<string> {
  const { message } = await deleteUserAccount(id, input)
  users.value = users.value.filter((row) => row.id !== id)
  return message
}

export async function setAdminInquiryStatus(id: number, status: 'New' | 'In Progress' | 'Resolved'): Promise<boolean> {
  try {
    await updateInquiryStatus(id, status.toLowerCase().replace(' ', '_'))
    const item = inquiries.value.find((row) => row.id === id); if (item) item.status = status; return true
  } catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to update inquiry.'; return false }
}

export async function setAdminReportStatus(id: number, status: 'New' | 'In Progress' | 'Resolved'): Promise<boolean> {
  try {
    await setReportStatus(id, ({ New: 'open', 'In Progress': 'in_progress', Resolved: 'resolved' } as const)[status])
    const item = reports.value.find((row) => row.id === id); if (item) item.status = status; return true
  } catch (error) { adminError.value = error instanceof Error ? error.message : 'Unable to update report.'; return false }
}
