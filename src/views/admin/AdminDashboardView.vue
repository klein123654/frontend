<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AdminShell from '@/components/admin/AdminShell.vue'
import AttentionStrip from '@/components/dashboard/AttentionStrip.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import InsightPanel from '@/components/dashboard/InsightPanel.vue'
import CollapsibleSection from '@/components/dashboard/CollapsibleSection.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import MarketInsightsSection from '@/components/dashboard/MarketInsightsSection.vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import MeterList from '@/components/charts/MeterList.vue'
import RankedBars from '@/components/charts/RankedBars.vue'
import SparkLine from '@/components/charts/SparkLine.vue'
import { changeText, fetchAdminDashboard, weekLabel, type AdminDashboard, type AdminMetric, type DashboardPeriod } from '@/services/dashboardService'
import { formatDate } from '@/utils/format'

/** Site overview: review to-dos, four clickable headline cards, and collapsible detail sections. */
const days = ref<DashboardPeriod>(30)
const metric = ref<AdminMetric>('listings')
const data = ref<AdminDashboard | null>(null)
const loading = ref(true)
const error = ref('')
const marketSummary = ref('')

async function load() {
  loading.value = data.value === null
  error.value = ''
  try {
    data.value = await fetchAdminDashboard(days.value)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'The dashboard could not be loaded.'
  } finally {
    loading.value = false
  }
}
watch(days, load)
onMounted(load)

const k = computed(() => data.value?.kpis)
const waited = (iso: string | null) => {
  if (!iso) return '—'
  const daysWaiting = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  return daysWaiting < 1 ? 'Today' : daysWaiting === 1 ? '1 day' : `${daysWaiting} days`
}
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const attention = computed(() => {
  const a = data.value?.attention
  if (!a) return []
  const items: { text: string; to: string; tone: 'warn' | 'info' | 'bad' }[] = []
  if (a.pending_listings) items.push({ text: `${plural(a.pending_listings, 'listing', 'listings')} to review${a.oldest_pending_at ? ` · oldest ${waited(a.oldest_pending_at)}` : ''}`, to: '/admin/properties', tone: 'warn' })
  if (a.pending_verifications) items.push({ text: `${plural(a.pending_verifications, 'broker verification', 'broker verifications')} waiting`, to: '/admin/verifications', tone: 'warn' })
  if (a.pending_applications) items.push({ text: `${plural(a.pending_applications, 'publisher application', 'publisher applications')} waiting`, to: '/admin/publisher-applications', tone: 'info' })
  if (a.open_reports) items.push({ text: `${plural(a.open_reports, 'open report', 'open reports')}`, to: '/admin/reports', tone: 'bad' })
  if (a.dhsud_checks_due) items.push({ text: `${plural(a.dhsud_checks_due, 'broker', 'brokers')} due for a DHSUD affiliation check`, to: '/admin/verifications', tone: 'info' })
  return items
})

const toPoints = (rows: { week: string; value: number }[] | undefined) => (rows ?? []).map((w) => ({ label: weekLabel(w.week), value: w.value }))
const listingWeeks = computed(() => toPoints(data.value?.new_listings_per_week))
const userWeeks = computed(() => toPoints(data.value?.new_users_per_week))
const inquiryWeeks = computed(() => toPoints(data.value?.inquiries_per_week))

const statusRows = computed(() => {
  const s = data.value?.status_counts
  return s ? [
    { label: 'Published', value: s.published, color: '#16a34a' },
    { label: 'Pending review', value: s.pending, color: '#2563eb' },
    { label: 'Draft', value: s.draft, color: '#64748b' },
    { label: 'Rejected', value: s.rejected, color: '#dc2626' },
  ] : []
})
const availabilityRows = computed(() => {
  const a = data.value?.availability_counts
  return a ? [
    { label: 'Available', value: a.available, color: '#16a34a' },
    { label: 'Reserved', value: a.reserved, color: '#d97706' },
    { label: 'Rented / leased', value: a.rented, color: '#dc2626' },
    { label: 'Sold', value: a.sold, color: '#64748b' },
  ] : []
})
const roleRows = computed(() => {
  const r = data.value?.role_counts
  return r ? [
    { label: 'Buyers', value: r.buyer },
    { label: 'Owners', value: r.owner },
    { label: 'Brokers', value: r.broker },
    { label: 'Admins', value: r.admin },
  ] : []
})
const typeRows = computed(() => (data.value?.live_by_type ?? []).map((t) => ({ label: t.property_type, value: t.value })))
const queue = computed(() => data.value?.review_queue ?? [])

const panelTitles: Record<AdminMetric, [string, string]> = {
  listings: ['Listings submitted per week', 'Last 8 weeks · by first submission'],
  users: ['New accounts per week', 'Last 8 weeks'],
  inquiries: ['Inquiries per week', 'Last 8 weeks · all listings'],
  queue: ['Review queue', 'Oldest submissions first'],
}
</script>

<template>
  <AdminShell>
    <header class="dash__head">
      <div>
        <span class="admin-eyebrow">ADMIN WORKSPACE</span>
        <h1>Dashboard Overview</h1>
        <p>What needs review, and how the directory is growing.</p>
      </div>
      <select v-model.number="days" class="period" aria-label="Period">
        <option :value="7">Last 7 days</option>
        <option :value="30">Last 30 days</option>
        <option :value="90">Last 90 days</option>
      </select>
    </header>

    <p v-if="error" class="admin-notice" role="alert">{{ error }} <button type="button" class="retry" @click="load">Try again</button></p>
    <p v-if="loading" class="loading" role="status">Loading the dashboard…</p>

    <template v-if="data && k">
      <AttentionStrip title="Waiting for you" :items="attention" />

      <div class="kpis" role="tablist" aria-label="Headline figures">
        <KpiCard label="Live listings" :value="k.live_listings" :note="`${k.published_this_week} published in the last 7 days`" :selected="metric === 'listings'" controls="admin-panel" hint="Show trend" @select="metric = 'listings'">
          <template #spark><SparkLine :values="listingWeeks.map((w) => w.value)" /></template>
        </KpiCard>
        <KpiCard label="Accounts" :value="k.users" :note="`${k.new_users} new in the last ${days} days`" :selected="metric === 'users'" controls="admin-panel" hint="Show trend" @select="metric = 'users'">
          <template #spark><SparkLine :values="userWeeks.map((w) => w.value)" /></template>
        </KpiCard>
        <KpiCard label="Inquiries" :value="k.inquiries" :change="changeText(k.inquiries, k.previous_inquiries, days)" :selected="metric === 'inquiries'" controls="admin-panel" hint="Show trend" @select="metric = 'inquiries'" />
        <KpiCard label="Waiting for review" :value="k.pending_listings" :note="data.attention.oldest_pending_at ? `Oldest waiting ${waited(data.attention.oldest_pending_at)}` : 'Queue is clear'" :selected="metric === 'queue'" controls="admin-panel" hint="Show queue" @select="metric = 'queue'" />
      </div>

      <InsightPanel id="admin-panel" :title="panelTitles[metric][0]" :subtitle="panelTitles[metric][1]" scope="admin" :metric="metric" :days="days">
        <ColumnChart v-if="metric === 'listings'" :points="listingWeeks" unit="listings" />
        <ColumnChart v-else-if="metric === 'users'" :points="userWeeks" unit="accounts" />
        <LineChart v-else-if="metric === 'inquiries'" :points="inquiryWeeks" unit="inquiries" />
        <template v-else>
          <ul v-if="queue.length" class="queue">
            <li v-for="item in queue" :key="item.id">
              <span><b>{{ item.title }}</b><small>{{ item.property_type }} · {{ item.listing_type === 'sale' ? 'For sale' : 'For rent' }}<template v-if="item.publisher"> · {{ item.publisher }}</template></small></span>
              <span class="queue__age">{{ waited(item.waiting_since) }}</span>
            </li>
          </ul>
          <p v-else class="mini">Nothing is waiting for review.</p>
        </template>
        <template #extra>
          <template v-if="metric === 'users'">
            <p class="mini">Accounts by role</p>
            <RankedBars :rows="roleRows" />
          </template>
          <template v-else-if="metric === 'listings' && typeRows.length">
            <p class="mini">Live listings by type</p>
            <RankedBars :rows="typeRows.slice(0, 5)" />
          </template>
        </template>
      </InsightPanel>

      <CollapsibleSection id="admin-listings" title="Listings & users" :summary="`${k.live_listings} live · ${k.pending_listings} pending · ${k.users} accounts`">
        <div class="grid">
          <ChartCard title="Review status" :columns="['Status', 'Listings']" :rows="statusRows.map((r) => [r.label, r.value])"><MeterList :rows="statusRows" /></ChartCard>
          <ChartCard title="Availability of live listings" :columns="['Availability', 'Listings']" :rows="availabilityRows.map((r) => [r.label, r.value])"><MeterList :rows="availabilityRows" /></ChartCard>
          <ChartCard title="Accounts by role" :columns="['Role', 'Accounts']" :rows="roleRows.map((r) => [r.label, r.value])"><RankedBars :rows="roleRows" /></ChartCard>
          <ChartCard title="Live listings by type" :columns="['Type', 'Listings']" :rows="typeRows.map((r) => [r.label, r.value])">
            <RankedBars v-if="typeRows.length" :rows="typeRows" />
            <p v-else class="mini">No live listings yet.</p>
          </ChartCard>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="admin-queue" title="Review queue" :summary="k.pending_listings ? `${plural(k.pending_listings, 'listing', 'listings')} waiting` : 'Nothing waiting'">
        <table v-if="queue.length" class="table">
          <thead><tr><th>Listing</th><th>Publisher</th><th>Type</th><th>Submitted</th><th>Waiting</th></tr></thead>
          <tbody>
            <tr v-for="item in queue" :key="item.id">
              <td><b>{{ item.title }}</b></td>
              <td>{{ item.publisher ?? '—' }}<small v-if="item.publisher_role"> ({{ item.publisher_role }})</small></td>
              <td>{{ item.property_type }} · {{ item.listing_type === 'sale' ? 'For sale' : 'For rent' }}</td>
              <td>{{ item.waiting_since ? formatDate(item.waiting_since) : '—' }}</td>
              <td>{{ waited(item.waiting_since) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="mini">Nothing is waiting for review.</p>
        <RouterLink to="/admin/properties" class="more">Open property approvals →</RouterLink>
      </CollapsibleSection>

      <CollapsibleSection id="admin-market" title="Market insights" :summary="marketSummary || 'Butuan City market figures'">
        <MarketInsightsSection :days="days" mode="admin" @summary="marketSummary = $event" />
      </CollapsibleSection>
    </template>
  </AdminShell>
</template>

<style scoped>
.dash__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; }
.dash__head h1 { margin: 6px 0 4px; color: #142d4e; font-size: 30px; }
.dash__head p { margin: 0; color: #5e6d82; font-size: 14px; }
.period { min-height: 40px; padding: 8px 12px; border: 1px solid #c9d1db; border-radius: 10px; background: #fff; color: #142d4e; font: inherit; font-size: 13px; font-weight: 600; }
.retry { margin-left: 8px; padding: 0; border: 0; background: none; color: #1d4ed8; font: inherit; font-weight: 700; cursor: pointer; }
.loading { color: #5e6d82; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 14px; }
.mini { margin: 12px 0 4px; color: #5e6d82; font-size: 12.5px; }
.queue { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.queue li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f4f8; font-size: 13px; }
.queue li span:first-child { display: grid; gap: 2px; min-width: 0; }
.queue small { color: #5e6d82; font-size: 12px; }
.queue__age { flex-shrink: 0; padding: 3px 9px; border-radius: 999px; background: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.table { width: 100%; min-width: 0; border-collapse: collapse; font-size: 13px; }
.table th { text-align: left; color: #5e6d82; font-weight: 600; font-size: 12px; padding: 8px 6px; border-bottom: 1px solid #e7ebf0; }
.table td { padding: 10px 6px; border-bottom: 1px solid #f1f4f8; vertical-align: top; }
.table small { color: #5e6d82; }
.more { display: inline-block; margin-top: 12px; color: #1d4ed8; font-size: 13px; font-weight: 600; text-decoration: none; }
@media (max-width: 1100px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) {
  .dash__head { flex-direction: column; align-items: flex-start; }
  .grid { grid-template-columns: 1fr; }
  .kpis { gap: 10px; }
  .table, .table tbody, .table tr, .table td { display: block; width: auto; }
  .table thead { display: none; }
  .table tr { padding: 10px 0; border-bottom: 1px solid #f1f4f8; }
  .table td { padding: 2px 0; border: 0; overflow-wrap: anywhere; }
}
</style>
