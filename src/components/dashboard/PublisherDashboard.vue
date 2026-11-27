<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import AttentionStrip from '@/components/dashboard/AttentionStrip.vue'
import KpiCard from '@/components/dashboard/KpiCard.vue'
import InsightPanel from '@/components/dashboard/InsightPanel.vue'
import CollapsibleSection from '@/components/dashboard/CollapsibleSection.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import MarketInsightsSection from '@/components/dashboard/MarketInsightsSection.vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import LineChart from '@/components/charts/LineChart.vue'
import RankedBars from '@/components/charts/RankedBars.vue'
import MeterList from '@/components/charts/MeterList.vue'
import SparkLine from '@/components/charts/SparkLine.vue'
import { useAuth } from '@/composables/useAuth'
import { fetchMyInquiries, type BackendInquiry } from '@/services/inquiryService'
import { changeText, fetchPublisherDashboard, weekLabel, type DashboardPeriod, type PublisherDashboard, type PublisherMetric } from '@/services/dashboardService'
import { formatDate } from '@/utils/format'

/** Owner and broker dashboard: to-dos, four clickable headline cards, and collapsible detail sections. */
const props = defineProps<{ role: 'owner' | 'broker' }>()

const { user } = useAuth()
const base = computed(() => (props.role === 'broker' ? '/broker' : '/owner'))
const listingsPath = computed(() => `${base.value}/${props.role === 'broker' ? 'listings' : 'properties'}`)
const days = ref<DashboardPeriod>(30)
const metric = ref<PublisherMetric>('inquiries')
const data = ref<PublisherDashboard | null>(null)
const loading = ref(true)
const error = ref('')
const inquiries = ref<BackendInquiry[]>([])
const marketSummary = ref('')

async function load() {
  loading.value = data.value === null
  error.value = ''
  try {
    data.value = await fetchPublisherDashboard(days.value)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'The dashboard could not be loaded.'
  } finally {
    loading.value = false
  }
}
watch(days, load)
onMounted(() => {
  void load()
  fetchMyInquiries().then((r) => { inquiries.value = r.data.slice(0, 5) }).catch(() => { inquiries.value = [] })
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  const part = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const first = user.value?.name?.trim().split(/\s+/)[0]
  return first ? `${part}, ${first}.` : `${part}.`
})

const k = computed(() => data.value?.kpis)
const credentials = computed(() => data.value?.credentials ?? null)
/** Countdown bars appear only when a credential needs attention. */
const credentialsNeedAttention = computed(() => {
  const c = credentials.value
  if (!c || c.status !== 'verified') return false
  if (c.credential_status === 'expired' || c.credential_status === 'missing') return true
  return [c.prc_days_left, c.dhsud_days_left].some((d) => d !== null && d <= 60)
})

const verified = computed(() => credentials.value?.status === 'verified')
const credentialLabel = computed(() => {
  const c = credentials.value
  if (!c) return 'Not verified yet'
  if (c.status === 'pending') return 'Verification pending'
  if (c.status === 'rejected') return 'Verification rejected'
  return credentialsNeedAttention.value ? 'Renewal needed' : '✓ Verified broker'
})

const attention = computed(() => {
  const a = data.value?.attention
  if (!a) return []
  const items: { text: string; to: string; tone: 'warn' | 'info' | 'bad' }[] = []
  if (a.unanswered_inquiries) items.push({ text: `${a.unanswered_inquiries} ${a.unanswered_inquiries === 1 ? 'inquiry' : 'inquiries'} waiting for a reply`, to: `${base.value}/inquiries`, tone: 'warn' })
  if (a.needs_confirmation) items.push({ text: `${a.needs_confirmation} ${a.needs_confirmation === 1 ? 'listing' : 'listings'} to confirm are still available`, to: listingsPath.value, tone: 'warn' })
  if (a.rejected) items.push({ text: `${a.rejected} rejected ${a.rejected === 1 ? 'listing needs' : 'listings need'} changes`, to: listingsPath.value, tone: 'bad' })
  if (a.drafts) items.push({ text: `${a.drafts} ${a.drafts === 1 ? 'draft' : 'drafts'} not submitted yet`, to: listingsPath.value, tone: 'info' })
  const c = credentials.value
  if (c && credentialsNeedAttention.value) {
    const soonest = Math.min(...[c.prc_days_left, c.dhsud_days_left].filter((d): d is number => d !== null))
    items.push({
      text: c.credential_status === 'expired' || soonest < 0 ? 'Broker registration expired — renew' : c.credential_status === 'missing' ? 'Add your credential validity dates' : `A credential expires in ${soonest} days — renew`,
      to: '/broker/profile',
      tone: 'bad',
    })
  }
  return items
})

const weeks = computed(() => (data.value?.inquiries_per_week ?? []).map((w) => ({ label: weekLabel(w.week), value: w.value })))
const viewDays = computed(() => (data.value?.views_per_day ?? []).map((d) => ({ label: weekLabel(d.day), value: d.value })))
const byListing = computed(() => data.value?.by_listing ?? [])
const rates = computed(() => byListing.value.filter((l) => l.views > 0)
  .map((l) => ({ label: l.title, value: Math.round((l.inquiries / l.views) * 1000) / 10, sub: `${l.inquiries} inquiries · ${l.views} views` }))
  .sort((a, b) => b.value - a.value).slice(0, 6))

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

const panelTitles: Record<PublisherMetric, [string, string]> = {
  listings: ['Your listings', 'Review status and availability'],
  inquiries: ['Inquiries per week', 'Last 8 weeks · all your listings'],
  views: ['Page views per day', 'Every day of the selected period'],
  rate: ['Inquiries per 100 views', 'By listing, for listings with views in this period'],
}
const priorityClass = (p: string) => ({ high: 'p-high', medium: 'p-med', low: 'p-low' } as Record<string, string>)[p] ?? 'p-low'
const received = (iso: string) => {
  const hours = (Date.now() - new Date(iso).getTime()) / 3_600_000
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)} ${Math.floor(hours) === 1 ? 'hour' : 'hours'} ago`
  if (hours < 48) return 'Yesterday'
  return formatDate(iso)
}
</script>

<template>
  <div class="dash">
    <header class="dash__head">
      <div>
        <span class="eyebrow">{{ role === 'broker' ? 'BROKER WORKSPACE' : 'OWNER WORKSPACE' }}</span>
        <h1>Dashboard Overview</h1>
        <p>{{ greeting }} Here’s how your listings are doing.</p>
      </div>
      <label class="period">
        <span class="sr-only">Period</span>
        <select v-model.number="days" aria-label="Period">
          <option :value="7">Last 7 days</option>
          <option :value="30">Last 30 days</option>
          <option :value="90">Last 90 days</option>
        </select>
      </label>
    </header>

    <p v-if="error" class="dash__error" role="alert">{{ error }} <button type="button" @click="load">Try again</button></p>
    <p v-if="loading" class="dash__loading" role="status">Loading your dashboard…</p>

    <template v-if="data && k">
      <AttentionStrip title="Needs your attention" :items="attention" />

      <div v-if="role === 'broker'" class="cred" :class="{ 'cred--warn': credentialsNeedAttention || !verified }" data-testid="credential-line">
        <span class="pill" :class="credentialsNeedAttention || !verified ? 'pill--warn' : 'pill--ok'">{{ credentialLabel }}</span>
        <template v-if="credentials">
          <span>PRC license <b>{{ credentials.license_number ?? '—' }}</b> · valid until {{ credentials.prc_valid_until ? formatDate(credentials.prc_valid_until) : 'not given' }}</span>
          <span>DHSUD registration <b>{{ credentials.dhsud_registration_number ?? '—' }}</b> · valid until {{ credentials.dhsud_valid_until ? formatDate(credentials.dhsud_valid_until) : 'not given' }}</span>
          <span v-if="credentials.firm_name || credentials.affiliations.length">{{ [credentials.firm_name, ...credentials.affiliations].filter(Boolean).join(' · ') }}</span>
        </template>
        <span v-else>Submit your PRC license and DHSUD registration to start listing.</span>
        <RouterLink to="/broker/profile" class="cred__link">Manage verification →</RouterLink>
        <div v-if="credentials && credentialsNeedAttention" class="cred__bars">
          <div v-for="item in [{ name: 'PRC license', left: credentials.prc_days_left, span: 1095 }, { name: 'DHSUD registration', left: credentials.dhsud_days_left, span: 365 }]" :key="item.name" class="cred__bar">
            <span>{{ item.name }}: <b>{{ item.left === null ? 'date missing' : item.left < 0 ? 'expired' : `${item.left} days left` }}</b></span>
            <span class="cred__track"><span :style="{ width: `${item.left === null ? 0 : Math.max(0, Math.min(100, (item.left / item.span) * 100))}%`, background: item.left !== null && item.left > 60 ? '#16a34a' : '#d97706' }" /></span>
          </div>
        </div>
      </div>

      <div class="kpis" role="tablist" aria-label="Headline figures">
        <KpiCard label="Live listings" :value="k.live_listings" :note="`of ${k.total_listings} · ${k.pending_listings} pending review`" :selected="metric === 'listings'" controls="publisher-panel" hint="Show breakdown" @select="metric = 'listings'" />
        <KpiCard label="Inquiries" :value="k.inquiries" :change="changeText(k.inquiries, k.previous_inquiries, days)" :note="`${k.inquiries_this_week} in the last 7 days`" :selected="metric === 'inquiries'" controls="publisher-panel" hint="Show trend" @select="metric = 'inquiries'" />
        <KpiCard label="Page views" :value="k.views.toLocaleString('en-PH')" :change="changeText(k.views, k.previous_views, days, true)" :selected="metric === 'views'" controls="publisher-panel" hint="Show trend" @select="metric = 'views'">
          <template #spark><SparkLine :values="viewDays.slice(-14).map((d) => d.value)" /></template>
        </KpiCard>
        <KpiCard label="Inquiries per 100 views" :value="k.inquiries_per_100_views ?? '—'" note="How often a visitor sends an inquiry" :selected="metric === 'rate'" controls="publisher-panel" hint="Show by listing" @select="metric = 'rate'" />
      </div>

      <InsightPanel id="publisher-panel" :title="panelTitles[metric][0]" :subtitle="panelTitles[metric][1]" scope="publisher" :metric="metric" :days="days">
        <div v-if="metric === 'listings'" class="two-col">
          <div><p class="mini">Review status</p><MeterList :rows="statusRows" /></div>
          <div><p class="mini">Availability of live listings</p><MeterList :rows="availabilityRows" /></div>
        </div>
        <ColumnChart v-else-if="metric === 'inquiries'" :points="weeks" unit="inquiries" />
        <LineChart v-else-if="metric === 'views'" :points="viewDays" unit="views" :label-every="Math.max(1, Math.round(viewDays.length / 6))" />
        <template v-else>
          <RankedBars v-if="rates.length" :rows="rates" :format="(v) => `${v}`" />
          <p v-else class="mini">No page views in this period yet.</p>
        </template>
        <template #extra>
          <template v-if="metric === 'inquiries' && byListing.some((l) => l.inquiries)">
            <p class="mini">By listing, this period</p>
            <RankedBars :rows="[...byListing].sort((a, b) => b.inquiries - a.inquiries).filter((l) => l.inquiries).slice(0, 5).map((l) => ({ label: l.title, value: l.inquiries }))" />
          </template>
          <template v-else-if="metric === 'views' && byListing.some((l) => l.views)">
            <p class="mini">Views by listing</p>
            <RankedBars :rows="byListing.filter((l) => l.views).slice(0, 5).map((l) => ({ label: l.title, value: l.views }))" />
          </template>
        </template>
      </InsightPanel>

      <CollapsibleSection id="publisher-listings" title="Your listings" :summary="`${k.live_listings} live · ${k.pending_listings} pending · ${data.status_counts.draft} draft`">
        <div class="grid">
          <ChartCard title="Review status" :columns="['Status', 'Listings']" :rows="statusRows.map((r) => [r.label, r.value])"><MeterList :rows="statusRows" /></ChartCard>
          <ChartCard title="Availability of live listings" :columns="['Availability', 'Listings']" :rows="availabilityRows.map((r) => [r.label, r.value])"><MeterList :rows="availabilityRows" /></ChartCard>
          <ChartCard class="wide" title="Top listings by views" :subtitle="`Last ${days} days · inquiries under each name`" :columns="['Listing', 'Views', 'Inquiries']" :rows="byListing.map((l) => [l.title, l.views, l.inquiries])">
            <RankedBars v-if="byListing.length" :rows="byListing.slice(0, 6).map((l) => ({ label: l.title, value: l.views, sub: `${l.inquiries} ${l.inquiries === 1 ? 'inquiry' : 'inquiries'}` }))" />
            <p v-else class="mini">No listings yet. <RouterLink :to="`${listingsPath}/create`">Add your first listing</RouterLink>.</p>
          </ChartCard>
        </div>
      </CollapsibleSection>

      <CollapsibleSection id="publisher-inquiries" title="Recent inquiries" :summary="data.attention.unanswered_inquiries ? `${data.attention.unanswered_inquiries} waiting for a reply` : 'All answered'">
        <table v-if="inquiries.length" class="table">
          <thead><tr><th>From</th><th>Property</th><th>AI summary</th><th>Priority</th><th>Received</th></tr></thead>
          <tbody>
            <tr v-for="inquiry in inquiries" :key="inquiry.id">
              <td><b>{{ inquiry.name }}</b><span v-if="inquiry.status === 'new'" class="pill pill--info">New</span></td>
              <td>{{ inquiry.property?.title ?? 'Listing' }}</td>
              <td>{{ inquiry.ai_summary ?? inquiry.message }}</td>
              <td><span v-if="inquiry.ai_priority !== 'unscored'" class="pill" :class="priorityClass(inquiry.ai_priority)">{{ inquiry.ai_priority[0]!.toUpperCase() + inquiry.ai_priority.slice(1) }}</span></td>
              <td>{{ received(inquiry.created_at) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="mini">No inquiries yet.</p>
        <RouterLink :to="`${base}/inquiries`" class="more">All inquiries →</RouterLink>
      </CollapsibleSection>

      <CollapsibleSection id="publisher-market" title="Market insights" :summary="marketSummary || 'Butuan City market figures'">
        <MarketInsightsSection :days="days" mode="publisher" :price-vs-market="data.price_vs_market" @summary="marketSummary = $event" />
      </CollapsibleSection>
    </template>
  </div>
</template>

<style scoped>
.dash { max-width: 1240px; margin: 0 auto; }
.dash__head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; margin-bottom: 18px; }
.eyebrow { color: #2563eb; font-size: 11px; font-weight: 800; letter-spacing: 1.3px; }
h1 { margin: 6px 0 4px; color: #142d4e; font-size: 30px; }
.dash__head p { margin: 0; color: #5e6d82; font-size: 14px; }
.period select { min-height: 40px; padding: 8px 12px; border: 1px solid #c9d1db; border-radius: 10px; background: #fff; color: #142d4e; font: inherit; font-size: 13px; font-weight: 600; }
.dash__error { padding: 12px 14px; border-radius: 10px; background: #fef2f2; color: #991b1b; }
.dash__error button { margin-left: 8px; border: 0; background: none; color: #1d4ed8; font: inherit; font-weight: 700; cursor: pointer; }
.dash__loading { color: #5e6d82; }
.kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 14px; }
.cred { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; margin-bottom: 18px; padding: 12px 16px; border: 1px solid #e7ebf0; border-radius: 14px; background: #fff; color: #334155; font-size: 13px; }
.cred--warn { border-color: #fcd34d; background: #fffbeb; }
.cred__link { margin-left: auto; color: #1d4ed8; font-weight: 600; text-decoration: none; }
.cred__bars { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
.cred__bar { display: grid; gap: 5px; }
.cred__track { height: 10px; border-radius: 999px; background: #f1f4f8; overflow: hidden; }
.cred__track span { display: block; height: 100%; border-radius: 999px; }
.pill { display: inline-flex; align-items: center; margin-left: 6px; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
.cred .pill { margin-left: 0; }
.pill--ok { background: #dcfce7; color: #166534; }
.pill--warn { background: #fef3c7; color: #92400e; }
.pill--info { background: #dbeafe; color: #1e40af; }
.p-high { background: #fee2e2; color: #991b1b; margin-left: 0; }
.p-med { background: #fef3c7; color: #92400e; margin-left: 0; }
.p-low { background: #f1f5f9; color: #334155; margin-left: 0; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.mini { margin: 12px 0 4px; color: #5e6d82; font-size: 12.5px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.grid .wide { grid-column: 1 / -1; }
.table { width: 100%; border-collapse: collapse; font-size: 13px; }
.table th { text-align: left; color: #5e6d82; font-weight: 600; font-size: 12px; padding: 8px 6px; border-bottom: 1px solid #e7ebf0; }
.table td { padding: 10px 6px; border-bottom: 1px solid #f1f4f8; vertical-align: top; }
.more { display: inline-block; margin-top: 12px; color: #1d4ed8; font-size: 13px; font-weight: 600; text-decoration: none; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
@media (max-width: 1100px) { .kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) {
  .dash__head { flex-direction: column; align-items: flex-start; }
  .grid, .two-col, .cred__bars { grid-template-columns: 1fr; }
  .kpis { gap: 10px; }
  .table, .table tbody, .table tr, .table td { display: block; width: auto; }
  .table thead { display: none; }
  .table tr { padding: 10px 0; border-bottom: 1px solid #f1f4f8; }
  .table td { padding: 2px 0; border: 0; overflow-wrap: anywhere; }
}
</style>
