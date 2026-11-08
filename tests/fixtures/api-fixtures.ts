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
  if (key === 'GET admin/inquiries') return { data: [inquiry] }
  if (key === 'GET admin/reports') return { data: [report] }
  if (key === 'GET admin/publisher-applications') return { data: [application] }
  if (key === 'GET admin/dashboard') return { data: { properties: 2, pending_properties: 1, users: 5, inquiries: 1, reports: 1 } }
  if (key === 'POST ai/describe') return { success: true, description: 'A welcoming commercial space near central Butuan.' }
  if (key === 'POST ai/search') return { data: [listing] }
  if (key === 'GET ai/market-insight') return { data: { summary: 'Stable commercial demand.' } }
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
