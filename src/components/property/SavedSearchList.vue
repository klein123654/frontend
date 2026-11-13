<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BellRing } from '@lucide/vue'
import { deleteSavedSearch, fetchSavedSearches, type SavedSearch } from '@/services/savedSearchService'
import { browseQueryFromFilters } from '@/utils/savedSearch'

const searches = ref<SavedSearch[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    searches.value = await fetchSavedSearches()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load saved searches.'
  } finally {
    loading.value = false
  }
})

async function remove(search: SavedSearch) {
  error.value = ''
  try {
    await deleteSavedSearch(search.id)
    searches.value = searches.value.filter((item) => item.id !== search.id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to remove this search.'
  }
}

function lastAlert(search: SavedSearch): string {
  return search.last_alerted_at
    ? `Last alert ${new Date(search.last_alerted_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
    : 'No matches yet'
}
</script>

<template>
  <section id="saved-searches" class="saved-searches" aria-labelledby="saved-searches-heading">
    <div class="heading">
      <BellRing :size="22" aria-hidden="true" />
      <div>
        <h2 id="saved-searches-heading">Saved searches</h2>
        <p>We email you when a new listing matches one of these. Up to 10 searches.</p>
      </div>
    </div>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="muted">Loading saved searches…</p>
    <ul v-else-if="searches.length" class="list">
      <li v-for="search in searches" :key="search.id">
        <div>
          <strong>{{ search.name }}</strong>
          <span class="muted">{{ lastAlert(search) }}</span>
        </div>
        <div class="actions">
          <RouterLink :to="{ path: '/properties', query: browseQueryFromFilters(search.filters) }">See results</RouterLink>
          <button type="button" :aria-label="`Stop alerts for ${search.name}`" @click="remove(search)">Remove</button>
        </div>
      </li>
    </ul>
    <p v-else class="muted">
      No saved searches yet. On <RouterLink to="/properties">Browse Properties</RouterLink>, pick your filters and choose
      “Save search &amp; get email alerts”.
    </p>
  </section>
</template>

<style scoped>
.saved-searches {
  margin-top: 40px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
}

.heading {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  color: #2563eb;
}

h2 {
  margin: 0 0 4px;
  color: #142d4e;
  font-size: 20px;
}

p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}

.muted {
  color: #5e6d82;
}

.muted a,
.actions a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.error {
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
}

.list {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.list li {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.list li > div:first-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.list strong {
  color: #142d4e;
  font-size: 15px;
}

.list .muted {
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 14px;
  align-items: center;
  font-size: 13px;
}

.actions button {
  border: 0;
  background: none;
  color: #b91c1c;
  font: inherit;
  cursor: pointer;
}
</style>
