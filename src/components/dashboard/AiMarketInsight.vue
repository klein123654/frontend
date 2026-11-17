<script setup lang="ts">
import { formatPeso } from '@/utils/format'
import { onMounted, ref } from 'vue'
import { RefreshCw, TrendingUp } from '@lucide/vue'
import { apiRequest } from '@/services/api'

interface PriceStats {
  listing_type: 'rent' | 'lease' | 'sale'
  label: string
  listing_count: number
  median_price: number
  median_price_per_sqm: number | null
  price_unit: string
}

interface MarketAggregates {
  total_listings: number
  by_type: Array<{ property_type: string; listing_count: number; prices: PriceStats[] }>
  top_barangays: Array<{ barangay: string; listing_count: number }>
}

interface MarketInsightResponse {
  success: boolean
  message?: string
  summary: string | null
  ai_written?: boolean
  aggregates: MarketAggregates
}

const defaultAggregates: MarketAggregates = { total_listings: 0, by_type: [], top_barangays: [] }

const aggregates = ref<MarketAggregates>(defaultAggregates)
const summary = ref('')
const aiWritten = ref(false)
const message = ref('')
const loading = ref(false)
const loadError = ref('')

const formatPrice = formatPeso

function priceLine(stats: PriceStats): string {
  const unit = stats.listing_type === 'rent' ? ' / month' : ''
  const perSqm = stats.median_price_per_sqm ? ` · ${formatPrice(stats.median_price_per_sqm)}/sq m${unit}` : ''
  return `${formatPrice(stats.median_price)}${unit}${perSqm}`
}

async function refresh() {
  if (loading.value) return

  loading.value = true
  loadError.value = ''

  try {
    const response = await apiRequest<MarketInsightResponse>('ai/market-insight')
    const payload = response ?? ({ aggregates: defaultAggregates, summary: '', message: '' } as MarketInsightResponse)

    aggregates.value = payload.aggregates ?? defaultAggregates
    summary.value = payload.summary ?? ''
    aiWritten.value = Boolean(payload.ai_written)
    message.value = payload.message ?? ''
  } catch (cause) {
    loadError.value = cause instanceof Error
      ? cause.message
      : 'Market insights could not be loaded. Please try again.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void refresh()
})
</script>

<template>
  <section class="market-panel" aria-labelledby="market-insight-title">
    <header class="panel-header">
      <div class="heading-copy">
        <span class="panel-icon" aria-hidden="true"><TrendingUp :size="18" /></span>
        <div>
          <p class="eyebrow">Published market data</p>
          <h2 id="market-insight-title">Market Insights</h2>
        </div>
      </div>
      <button
        type="button"
        class="refresh-button"
        :disabled="loading"
        aria-label="Refresh market insights"
        title="Refresh market insights"
        @click="refresh"
      >
        <RefreshCw :size="16" :class="{ spinning: loading }" />
        <span>Refresh</span>
      </button>
    </header>

    <p v-if="loadError" class="notice notice-error" role="alert">{{ loadError }}</p>
    <p v-else-if="message" class="notice" role="status">{{ message }}</p>
    <p v-if="summary" class="summary">{{ summary }}</p>
    <p v-if="summary" class="summary-source">
      {{ aiWritten ? 'Summary written by AI from the figures below.' : 'Summary written from the figures below.' }}
    </p>

    <div v-if="loading && !aggregates.by_type?.length" class="loading" role="status">
      Loading listing data…
    </div>

    <div v-else class="aggregate-grid">
      <section class="aggregate-section">
        <h3>Median asking price by type</h3>
        <div v-if="aggregates.by_type?.length" class="aggregate-list">
          <div v-for="row in aggregates.by_type" :key="row.property_type" class="type-block">
            <div class="aggregate-row">
              <span>{{ row.property_type }}</span>
              <small>{{ row.listing_count }} {{ row.listing_count === 1 ? 'listing' : 'listings' }}</small>
            </div>
            <div v-for="stats in row.prices" :key="stats.listing_type" class="price-row">
              <span>{{ stats.label }} ({{ stats.listing_count }})</span>
              <strong>{{ priceLine(stats) }}</strong>
            </div>
          </div>
        </div>
        <p v-else class="empty">No published listing data yet.</p>
      </section>

      <section class="aggregate-section">
        <h3>Barangays with the most listings</h3>
        <div v-if="aggregates.top_barangays?.length" class="aggregate-list">
          <div v-for="row in aggregates.top_barangays" :key="row.barangay" class="aggregate-row">
            <span>{{ row.barangay }}</span>
            <strong>{{ row.listing_count }}</strong>
            <small>{{ row.listing_count === 1 ? 'listing' : 'listings' }}</small>
          </div>
        </div>
        <p v-else class="empty">No published listing data yet.</p>
      </section>
    </div>
  </section>
</template>

<style scoped>
.market-panel {
  margin-bottom: 24px;
  padding: 22px 24px;
  border: 1px solid #d9e5e3;
  border-radius: 8px;
  background: #fbfdfc;
}

.panel-header,
.heading-copy,
.aggregate-row {
  display: flex;
  align-items: center;
}

.panel-header {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.heading-copy {
  min-width: 0;
  gap: 12px;
}

.panel-icon {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 7px;
  background: #e7f4f1;
  color: #2563eb;
}

.eyebrow {
  margin: 0 0 3px;
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #142d4e;
  font-size: 18px;
}

.refresh-button {
  display: inline-flex;
  min-height: 36px;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 11px;
  border: 1px solid #b7d6d0;
  border-radius: 6px;
  background: white;
  color: #2563eb;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
}

.refresh-button:disabled {
  cursor: wait;
  opacity: .6;
}

.summary {
  margin: 0 0 17px;
  padding: 12px 14px;
  border-left: 3px solid #2563eb;
  background: #edf7f4;
  color: #315d58;
  font-size: 13px;
  line-height: 1.6;
}

.notice {
  margin: 0 0 14px;
  color: #52657b;
  font-size: 12px;
  line-height: 1.5;
}

.notice-error { color: #a33b2b; }

.aggregate-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.aggregate-section h3 {
  margin: 0 0 8px;
  color: #334155;
  font-size: 12px;
}

.aggregate-list { display: grid; }

.aggregate-row {
  min-width: 0;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 0;
  border-top: 1px solid #e8efed;
  color: #334155;
  font-size: 12px;
}

.aggregate-row span {
  flex: 1 1 auto;
  min-width: 0;
  overflow-wrap: anywhere;
}

.aggregate-row small {
  min-width: 44px;
  text-align: right;
}

.aggregate-row strong {
  flex: 0 0 auto;
  color: #142d4e;
  font-size: 12px;
}

.aggregate-row small {
  flex: 0 0 auto;
  color: #606c7f;
  font-size: 10px;
}

.empty,
.loading {
  margin: 0;
  padding: 10px 0;
  color: #606c7f;
  font-size: 12px;
}

.spinning { animation: spin 1s linear infinite; }

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 700px) {
  .market-panel { padding: 18px 16px; }
  .aggregate-grid { grid-template-columns: 1fr; gap: 18px; }
}
.summary-source {
  margin: -6px 0 14px;
  color: #64748b;
  font-size: 11px;
}

.type-block {
  display: grid;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5eeec;
}

.type-block:last-child {
  border-bottom: 0;
}

.price-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding-left: 10px;
  color: #475569;
  font-size: 12px;
}

.price-row strong {
  color: #142d4e;
  text-align: right;
}
</style>
