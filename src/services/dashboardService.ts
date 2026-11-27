import { apiRequest } from './api'

export type DashboardPeriod = 7 | 30 | 90
export type PublisherMetric = 'listings' | 'inquiries' | 'views' | 'rate'
export type AdminMetric = 'listings' | 'users' | 'inquiries' | 'queue'

export interface WeekValue { week: string; value: number }
export interface DayValue { day: string; value: number }

export interface PublisherDashboard {
  days: number
  attention: { unanswered_inquiries: number; needs_confirmation: number; drafts: number; rejected: number }
  kpis: {
    live_listings: number; total_listings: number; pending_listings: number
    inquiries: number; previous_inquiries: number; inquiries_this_week: number
    views: number; previous_views: number; inquiries_per_100_views: number | null
  }
  inquiries_per_week: WeekValue[]
  views_per_day: DayValue[]
  by_listing: { id: number; title: string; views: number; inquiries: number }[]
  status_counts: Record<'published' | 'pending' | 'draft' | 'rejected', number>
  availability_counts: Record<'available' | 'reserved' | 'rented' | 'sold', number>
  price_vs_market: { id: number; title: string; property_type: string; listing_type: string; value: number; min: number; median: number; max: number; comparables: number }[]
  credentials: null | {
    status: string; credential_status: 'current' | 'expiring' | 'expired' | 'missing'
    license_number: string | null; prc_valid_until: string | null; prc_days_left: number | null
    dhsud_registration_number: string | null; dhsud_valid_until: string | null; dhsud_days_left: number | null
    firm_name: string | null; affiliations: string[]
  }
}

export interface MarketDashboard {
  days: number
  live_listings: number
  median_rent_per_sqm: { property_type: string; value: number; listings: number }[]
  inquiries_per_listing_by_type: { property_type: string; value: number; listings: number }[]
  listings_by_barangay: { barangay: string; value: number }[]
  inquiries_by_barangay: { barangay: string; value: number }[]
  new_listings_per_week: WeekValue[]
}

export interface AdminDashboard {
  days: number
  attention: { pending_listings: number; oldest_pending_at: string | null; pending_verifications: number; pending_applications: number; open_reports: number; dhsud_checks_due: number }
  kpis: { live_listings: number; published_this_week: number; users: number; new_users: number; inquiries: number; previous_inquiries: number; pending_listings: number }
  new_listings_per_week: WeekValue[]
  new_users_per_week: WeekValue[]
  inquiries_per_week: WeekValue[]
  status_counts: Record<'published' | 'pending' | 'draft' | 'rejected', number>
  availability_counts: Record<'available' | 'reserved' | 'rented' | 'sold', number>
  role_counts: Record<'buyer' | 'owner' | 'broker' | 'admin', number>
  live_by_type: { property_type: string; value: number }[]
  review_queue: { id: number; title: string; publisher: string | null; publisher_role: string | null; property_type: string; listing_type: string; waiting_since: string | null }[]
}

export interface CardInsight { bullets: string[]; ai_written: boolean }

export async function fetchPublisherDashboard(days: DashboardPeriod) {
  return (await apiRequest<{ data: PublisherDashboard }>(`my/dashboard?days=${days}`)).data
}

export async function fetchMarketDashboard(days: DashboardPeriod) {
  return (await apiRequest<{ data: MarketDashboard }>(`dashboard/market?days=${days}`)).data
}

export async function fetchAdminDashboard(days: DashboardPeriod) {
  return (await apiRequest<{ data: AdminDashboard }>(`admin/dashboard/overview?days=${days}`)).data
}

/** Insights already loaded this session, so switching cards back and forth is instant. */
export const insightCache = new Map<string, CardInsight>()

export async function fetchCardInsight(scope: 'publisher' | 'admin', metric: string, days: DashboardPeriod) {
  const path = scope === 'admin' ? 'admin/dashboard/insight' : 'my/dashboard/insight'
  return (await apiRequest<{ data: CardInsight }>(path, { method: 'POST', body: JSON.stringify({ metric, days }) })).data
}

export async function fetchMarketSummary() {
  return apiRequest<{ success: boolean; summary?: string | null; ai_written?: boolean; message?: string }>('ai/market-insight')
}

/** Short label for a week start, e.g. "Nov 24". */
export function weekLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, d!)).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

/** Signed change between two periods, e.g. "▲ 5 vs previous 30 days". */
export function changeText(current: number, previous: number, days: number, asPercent = false): { text: string; up: boolean } | null {
  if (previous === 0 && current === 0) return null
  const diff = current - previous
  const up = diff >= 0
  const amount = asPercent && previous > 0 ? `${Math.abs(Math.round((diff / previous) * 100))}%` : String(Math.abs(diff))
  return { text: `${up ? '▲' : '▼'} ${amount} vs previous ${days} days`, up }
}
