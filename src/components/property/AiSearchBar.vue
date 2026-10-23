<script setup lang="ts">
import { ref } from 'vue'
import { LoaderCircle, Search } from '@lucide/vue'
import PropertyCard from '@/components/property/PropertyCard.vue'
import { apiRequest } from '@/services/api'
import { mapProperty, type BackendProperty } from '@/services/propertyService'
import type { Property } from '@/types/property'

interface AiSearchResponse {
  success: boolean
  message?: string
  summary?: string
  listings?: BackendProperty[]
}

const query = ref('')
const loading = ref(false)
const message = ref('')
const summary = ref('')
const listings = ref<Property[]>([])

async function search() {
  const searchQuery = query.value.trim()
  if (!searchQuery || loading.value) return

  loading.value = true
  message.value = ''
  summary.value = ''
  listings.value = []

  try {
    const response = await apiRequest<AiSearchResponse>('ai/search', {
      method: 'POST',
      body: JSON.stringify({ query: searchQuery }),
    })

    if (!response.success) {
      message.value = response.message || 'AI property search is temporarily unavailable.'
      return
    }

    summary.value = response.summary || ''
    listings.value = (response.listings || []).map(mapProperty)
  } catch (cause) {
    message.value = cause instanceof Error
      ? cause.message
      : 'AI property search is temporarily unavailable. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="ai-search" aria-labelledby="ai-search-title">
    <div class="search-heading">
      <div>
        <p class="eyebrow">Butuan commercial listings</p>
        <h2 id="ai-search-title">Describe the space your business needs</h2>
      </div>
      <span class="ai-mark" aria-hidden="true">AI</span>
    </div>

    <form class="search-form" @submit.prevent="search">
      <label class="sr-only" for="ai-property-query">Describe the property you are looking for</label>
      <input
        id="ai-property-query"
        v-model="query"
        type="search"
        minlength="2"
        maxlength="500"
        placeholder="For example: 200 sqm warehouse in Butuan under ₱80,000/month"
        :disabled="loading"
      />
      <button type="submit" :disabled="loading || query.trim().length < 2">
        <LoaderCircle v-if="loading" :size="17" class="spin" aria-hidden="true" />
        <Search v-else :size="17" aria-hidden="true" />
        <span>{{ loading ? 'Searching' : 'Search with AI' }}</span>
      </button>
    </form>

    <div v-if="loading" class="notice" role="status">Finding commercial spaces that match.</div>
    <div v-else-if="message" class="notice notice-error" role="status">{{ message }}</div>

    <div v-if="summary" class="ai-results" aria-live="polite">
      <p class="summary">{{ summary }}</p>
      <div v-if="listings.length" class="listing-grid">
        <PropertyCard v-for="property in listings" :key="property.id" :property="property" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.ai-search {
  padding: 26px 0 30px;
  border-bottom: 1px solid #e2e8f0;
}

.search-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #087e75;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  color: #142d4e;
  font-size: 21px;
  line-height: 1.3;
}

.ai-mark {
  display: grid;
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #9bd6cb;
  border-radius: 6px;
  color: #087e75;
  font-size: 11px;
  font-weight: 800;
}

.search-form {
  display: flex;
  gap: 10px;
}

.search-form input {
  min-width: 0;
  flex: 1;
  padding: 13px 15px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #142d4e;
  font: inherit;
}

.search-form input:focus {
  border-color: #087e75;
  outline: 2px solid #087e7526;
}

.search-form button {
  display: inline-flex;
  min-height: 46px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 17px;
  border: 0;
  border-radius: 6px;
  background: #087e75;
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
}

.search-form button:disabled {
  cursor: not-allowed;
  opacity: .58;
}

.notice {
  padding-top: 13px;
  color: #52657b;
  font-size: 13px;
}

.notice-error { color: #a33b2b; }

.summary {
  margin: 18px 0;
  color: #334155;
  line-height: 1.6;
}

.listing-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.spin { animation: spin 1s linear infinite; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 600px) {
  .search-form { flex-direction: column; }
  .search-form button { width: 100%; }
  .listing-grid { grid-template-columns: 1fr; }
}
</style>
