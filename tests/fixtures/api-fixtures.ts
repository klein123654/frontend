import { application, brokerListing, draftListing, inquiry, inquiryMessage, listing, pendingListing, report, users, verification, type AppRole } from './test-data'

export type ApiScenario = 'success' | 'empty' | 'error' | 'loading' | 'validation'
export type ApiOverride = ApiScenario | { scenario: ApiScenario; body?: unknown; status?: number; delayMs?: number }
export type ApiOverrides = Record<string, ApiOverride>

export function endpointKey(method: string, pathname: string): string {
  const pathWithoutQuery = pathname.split('?')[0]
  return `${method.toUpperCase()} ${pathWithoutQuery.replace(/^.*\/api\/?/, '').replace(/\/$/, '')}`
}

const adminProperties = [
  { ...pendingListing, owner: { name: users.owner.name, email: users.owner.email } },
  { ...listing, owner: { name: users.owner.name, email: users.owner.email } },
]

const weeks = ['2026-10-05', '2026-10-12', '2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09', '2026-11-16', '2026-11-23']
const perWeek = (values: number[]) => weeks.map((week, index) => ({ week, value: values[index] ?? 0 }))

function publisherDashboard(role?: AppRole) {
  return {
    days: 30,
    attention: { unanswered_inquiries: 1, needs_confirmation: 0, drafts: 1, rejected: 0 },
    kpis: { live_listings: 1, total_listings: 3, pending_listings: 1, inquiries: 4, previous_inquiries: 2, inquiries_this_week: 1, views: 120, previous_views: 90, inquiries_per_100_views: 3.3 },
    inquiries_per_week: perWeek([0, 1, 0, 2, 1, 0, 1, 1]),
    views_per_day: Array.from({ length: 30 }, (_, index) => ({ day: `2026-11-${String(index + 1).padStart(2, '0')}`, value: (index * 7) % 9 })),
    by_listing: [{ id: listing.id, title: listing.title, views: 120, inquiries: 4 }],
    status_counts: { published: 1, pending: 1, draft: 1, rejected: 0 },
    availability_counts: { available: 1, reserved: 0, rented: 0, sold: 0 },
    price_vs_market: [{ id: listing.id, title: listing.title, property_type: 'Office', listing_type: 'rent', value: 333, min: 250, median: 300, max: 420, comparables: 4 }],
    credentials: role === 'broker' ? {
      status: 'verified', credential_status: 'current', license_number: 'PRC-0012345', prc_valid_until: '2028-06-30', prc_days_left: 581,
      dhsud_registration_number: 'DHSUD-XIII-0456', dhsud_valid_until: '2027-09-30', dhsud_days_left: 307, firm_name: 'Agusan Realty', affiliations: [],
    } : null,
  }
}

const marketDashboard = {
  days: 30,
  live_listings: 12,
  median_rent_per_sqm: [{ property_type: 'Office', value: 300, listings: 4 }, { property_type: 'Retail', value: 380, listings: 3 }],
  inquiries_per_listing_by_type: [{ property_type: 'Office', value: 1.5, listings: 4 }, { property_type: 'Retail', value: 2, listings: 3 }],
  listings_by_barangay: [{ barangay: 'Libertad', value: 4 }, { barangay: 'Baan KM 3', value: 3 }],
  inquiries_by_barangay: [{ barangay: 'Libertad', value: 6 }],
  new_listings_per_week: perWeek([1, 0, 2, 1, 0, 3, 1, 2]),
}

const adminDashboard = {
  days: 30,
  attention: { pending_listings: 1, oldest_pending_at: '2026-11-20T08:00:00.000000Z', pending_verifications: 1, pending_applications: 1, open_reports: 1, dhsud_checks_due: 0 },
  kpis: { live_listings: 12, published_this_week: 2, users: 5, new_users: 2, inquiries: 9, previous_inquiries: 6, pending_listings: 1 },
  new_listings_per_week: perWeek([1, 0, 2, 1, 0, 3, 1, 2]),
  new_users_per_week: perWeek([0, 1, 0, 0, 1, 0, 0, 1]),
  inquiries_per_week: perWeek([1, 2, 0, 1, 2, 1, 1, 1]),
  status_counts: { published: 12, pending: 1, draft: 2, rejected: 0 },
  availability_counts: { available: 10, reserved: 1, rented: 1, sold: 0 },
  role_counts: { buyer: 2, owner: 1, broker: 1, admin: 1 },
  live_by_type: [{ property_type: 'Office', value: 5 }, { property_type: 'Retail', value: 4 }],
  review_queue: [{ id: pendingListing.id, title: pendingListing.title, publisher: users.owner.name, publisher_role: 'owner', property_type: 'Office', listing_type: 'rent', waiting_since: '2026-11-20T08:00:00.000000Z' }],
}

export function defaultApiResponse(path: string, method: string, role?: AppRole): unknown {
  const key = endpointKey(method, path)
  if (key === 'POST login' && role) return { message: 'Login successful.', token: `e2e-${role}-token`, user: users[role] }
  if (key === 'POST register' && role) return { message: 'Account created successfully.', token: `e2e-${role}-token`, user: users[role] }
  if (key === 'GET user' && role) return { user: users[role] }
  if (key === 'GET properties') return { data: [listing], meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 } }
  if (key === `GET properties/${listing.id}`) return { data: listing }
  if (key === 'GET my/properties') {
    const records = role === 'broker' ? [brokerListing] : [listing, pendingListing, draftListing]
    return { data: records, meta: { current_page: 1, last_page: 1, total: records.length } }
  }
  if (key === 'GET my/saved-properties') return { data: [listing], meta: { current_page: 1, last_page: 1, total: 1 } }
  if (key === 'GET my/inquiries' || key === 'GET my/inquiries/sent') return { data: [inquiry] }
  if (key === `GET inquiries/${inquiry.id}/messages`) return { data: [inquiryMessage] }
  if (key === 'GET broker/verification') return {
    data: role === 'broker' ? { ...verification, status: 'verified' } : verification,
  }
  if (key === 'GET my/publisher-application') return { data: application }
  if (key === 'GET admin/properties') return { data: adminProperties }
  if (key === 'GET admin/verifications') return { data: [verification] }
  if (key === 'GET admin/users') return { data: Object.values(users).map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, account_status: user.account_status, created_at: '2026-10-01T10:00:00.000000Z' })) }
  if (key.startsWith('DELETE admin/users/')) {
    const deleted = Object.values(users).find((user) => key === `DELETE admin/users/${user.id}`)
    return { message: `The account for ${deleted?.name ?? 'this user'} was deleted.` }
  }
  if (key === 'GET admin/inquiries') return { data: [inquiry] }
  if (key === 'GET admin/reports') return { data: [report] }
  if (key === 'GET admin/publisher-applications') return { data: [application] }
  if (key === 'GET admin/dashboard') return { data: { properties: 2, pending_properties: 1, users: 5, inquiries: 1, reports: 1 } }
  if (key === 'POST ai/describe') return { success: true, description: 'A welcoming commercial space near central Butuan.' }
  if (key === 'POST ai/search') return { data: [listing] }
  if (key === 'GET ai/market-insight') return { success: true, summary: 'Stable commercial demand.' }
  if (key === 'GET my/dashboard') return { data: publisherDashboard(role) }
  if (key === 'GET dashboard/market') return { data: marketDashboard }
  if (key === 'GET admin/dashboard/overview') return { data: adminDashboard }
  if (key === 'POST my/dashboard/insight' || key === 'POST admin/dashboard/insight') return { data: { bullets: ['Inquiries rose this week.', 'Riverside Commercial Space received the most.'], ai_written: true } }
  if (key.startsWith('POST my/properties/')) {
    const id = Number(key.slice('POST my/properties/'.length))
    const existing = role === 'broker' ? brokerListing : [listing, pendingListing, draftListing].find((item) => item.id === id)
    return { data: { ...(existing ?? draftListing), id, status: 'draft' } }
  }
  if (key === 'GET properties' && path.includes('page=')) return { data: [listing], meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 } }
  if (key.endsWith('/messages') && method === 'POST') return { data: { ...inquiryMessage, id: 502, body: 'I can arrange a viewing on Friday.' } }
  if (method === 'GET') return { data: [] }
  return { message: 'Request completed.', data: { ...listing, id: 808, status: 'draft', broker: role === 'broker' ? brokerListing.broker : null } }
}

function overrideResponse(override: ApiOverride, fallback: unknown) {
  const details = typeof override === 'string' ? { scenario: override } : override
  switch (details.scenario) {
    case 'empty': return { status: 200, body: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } }, delayMs: details.delayMs }
    case 'error': return { status: details.status ?? 503, body: details.body ?? { message: 'The server is temporarily unavailable.', type: 'server_error' }, delayMs: details.delayMs }
    case 'validation': return { status: 422, body: details.body ?? { message: 'The given data was invalid.', type: 'validation_error', errors: { title: ['The title field is required.'] } }, delayMs: details.delayMs }
    case 'loading': return { status: 200, body: details.body ?? fallback, delayMs: details.delayMs ?? 400 }
    default: return { status: details.status ?? 200, body: details.body ?? fallback, delayMs: details.delayMs }
  }
}

export { overrideResponse }
