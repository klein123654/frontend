<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Sparkles } from '@lucide/vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import RankedBars from '@/components/charts/RankedBars.vue'
import RangeChart from '@/components/charts/RangeChart.vue'
import ColumnChart from '@/components/charts/ColumnChart.vue'
import { fetchMarketDashboard, fetchMarketSummary, weekLabel, type DashboardPeriod, type MarketDashboard, type PublisherDashboard } from '@/services/dashboardService'

/** Market-wide figures with the AI market summary; publishers also see their prices against similar listings. */
const props = defineProps<{
  days: DashboardPeriod
  mode: 'publisher' | 'admin'
  priceVsMarket?: PublisherDashboard['price_vs_market']
}>()
const emit = defineEmits<{ summary: [text: string] }>()

const market = ref<MarketDashboard | null>(null)
const summary = ref('')
const summaryByAi = ref(false)
const error = ref('')
const peso = (v: number) => `₱${v.toLocaleString('en-PH')}`
const listingKind = (t: string) => (t === 'lease' ? 'lease' : 'rent')

watch(() => props.days, async (days) => {
  error.value = ''
  try { market.value = await fetchMarketDashboard(days) } catch (cause) { error.value = cause instanceof Error ? cause.message : 'Market figures could not be loaded.' }
}, { immediate: true })

fetchMarketSummary().then((r) => { summary.value = r.success && r.summary ? r.summary : ''; summaryByAi.value = Boolean(r.ai_written) }).catch(() => { summary.value = '' })

watch(market, (m) => {
  const top = m?.median_rent_per_sqm[0]
  if (top) emit('summary', `Median ${top.property_type.toLowerCase()} rent ${peso(top.value)}/sqm`)
})

/** A computed (not AI) line about the publisher's own prices. */
const priceNote = computed(() => {
  const rows = props.priceVsMarket ?? []
  if (!rows.length) return ''
  const furthest = [...rows].sort((a, b) => Math.abs(b.value - b.median) / b.median - Math.abs(a.value - a.median) / a.median)[0]!
  const diff = furthest.value - furthest.median
  if (diff === 0) return `${furthest.title} asks exactly the median for similar listings (${peso(furthest.median)} per sqm).`
  return `${furthest.title} asks ${peso(furthest.value)} per sqm, ${diff > 0 ? 'above' : 'below'} the median of ${peso(furthest.median)} for ${furthest.comparables} similar listings.`
})
</script>

<template>
  <div class="market">
    <p v-if="error" class="market__error" role="alert">{{ error }}</p>
    <div v-if="summary" class="market__ai">
      <span class="market__icon" aria-hidden="true"><Sparkles :size="18" /></span>
      <div>
        <span class="market__label">{{ summaryByAi ? 'AI market insight' : 'Market summary' }}</span>
        <p>{{ summary }}</p>
        <p class="market__foot">Figures are computed by ButuanSpaces from asking prices on the site; {{ summaryByAi ? 'the AI only puts them into words.' : 'this summary is written from them directly.' }} Not a valuation.</p>
      </div>
    </div>
    <div v-if="market" class="market__grid">
      <ChartCard
        v-if="mode === 'publisher'"
        title="Your price vs the market"
        subtitle="Asking price per sqm per month, against similar live listings"
        :columns="['Listing', 'Your price/sqm', 'Lowest', 'Median', 'Highest', 'Similar listings']"
        :rows="(priceVsMarket ?? []).map((r) => [r.title, peso(r.value), peso(r.min), peso(r.median), peso(r.max), r.comparables])"
      >
        <RangeChart
          v-if="priceVsMarket?.length"
          :rows="priceVsMarket.map((r) => ({ label: r.title, sub: `vs ${r.comparables} ${r.property_type.toLowerCase()} for ${listingKind(r.listing_type)}`, min: r.min, median: r.median, max: r.max, value: r.value }))"
          :format="peso"
        />
        <p v-else class="market__empty">Shown for live rent or lease listings with a floor area, once at least 3 similar listings are on the site.</p>
        <template #note><p v-if="priceNote" class="market__note">{{ priceNote }}</p></template>
      </ChartCard>
      <ChartCard
        title="Median asking rent by property type"
        subtitle="Per sqm per month · rentals only"
        :columns="['Property type', 'Median rent/sqm', 'Listings']"
        :rows="market.median_rent_per_sqm.map((r) => [r.property_type, peso(r.value), r.listings])"
      >
        <RankedBars :rows="market.median_rent_per_sqm.map((r) => ({ label: r.property_type, value: r.value }))" :format="peso" />
        <p v-if="!market.median_rent_per_sqm.length" class="market__empty">No rentals with a floor area are live yet.</p>
      </ChartCard>
      <ChartCard
        title="Inquiries per listing by property type"
        :subtitle="`Last ${days} days · which spaces are in demand`"
        :columns="['Property type', 'Inquiries per listing', 'Live listings']"
        :rows="market.inquiries_per_listing_by_type.map((r) => [r.property_type, r.value, r.listings])"
      >
        <RankedBars :rows="market.inquiries_per_listing_by_type.map((r) => ({ label: r.property_type, value: r.value }))" />
      </ChartCard>
      <ChartCard
        title="Where listings are"
        subtitle="Live listings per barangay · top 6"
        :columns="['Barangay', 'Live listings', `Inquiries (${days} days)`]"
        :rows="market.listings_by_barangay.map((r, i) => [r.barangay, r.value, market!.inquiries_by_barangay[i]?.value ?? 0])"
      >
        <RankedBars :rows="market.listings_by_barangay.map((r) => ({ label: r.barangay, value: r.value }))" />
      </ChartCard>
      <ChartCard
        v-if="mode === 'admin'"
        title="Inquiries by barangay"
        :subtitle="`Last ${days} days · same barangays`"
        :columns="['Barangay', 'Inquiries']"
        :rows="market.inquiries_by_barangay.map((r) => [r.barangay, r.value])"
      >
        <RankedBars :rows="market.inquiries_by_barangay.map((r) => ({ label: r.barangay, value: r.value }))" />
      </ChartCard>
      <ChartCard
        title="New listings on the market"
        subtitle="Published per week · last 8 weeks"
        :columns="['Week of', 'New listings']"
        :rows="market.new_listings_per_week.map((r) => [weekLabel(r.week), r.value])"
      >
        <ColumnChart :points="market.new_listings_per_week.map((r) => ({ label: weekLabel(r.week), value: r.value }))" unit="listings" :height="210" />
      </ChartCard>
    </div>
  </div>
</template>

<style scoped>
.market__ai { display: grid; grid-template-columns: auto 1fr; gap: 14px; margin-bottom: 16px; padding: 16px 18px; border: 1px solid #dbeafe; border-radius: 14px; background: linear-gradient(180deg, #f8fbff, #fff); }
.market__icon { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; background: #eff6ff; color: #2563eb; }
.market__label { color: #2563eb; font-size: 11px; font-weight: 800; letter-spacing: .9px; text-transform: uppercase; }
.market__ai p { margin: 4px 0 0; color: #1e3a5f; font-size: 13.5px; line-height: 1.65; }
.market__ai .market__foot { color: #64748b; font-size: 11px; }
.market__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.market__empty, .market__note { margin: 8px 0 0; color: #5e6d82; font-size: 12.5px; }
.market__note { color: #142d4e; }
.market__error { color: #b91c1c; }
@media (max-width: 900px) { .market__grid { grid-template-columns: 1fr; } }
</style>
