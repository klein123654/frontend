<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProperties } from '@/composables/useProperties'
import AiSearchBar from '@/components/property/AiSearchBar.vue'
import PropertyCard from '@/components/property/PropertyCard.vue'
import SaveSearchButton from '@/components/property/SaveSearchButton.vue'

// Leaflet is large, so the results map loads only when someone opens it.
const ResultsMap = defineAsyncComponent(() => import('@/components/property/ResultsMap.vue'))
import { BUTUAN_BARANGAYS } from '@/data/butuanLocation'
import {
  ALL_LISTINGS,
  ALL_TYPES,
  SORT_OPTIONS,
  isSameQuery,
  parseBrowseQuery,
  toBrowseQuery,
  type PropertyBrowseState,
  type PropertySort,
} from '@/utils/propertyQuery'

const PAGE_SIZE = 12
const VIEW_KEY = 'butuanspaces_results_view'

const route = useRoute()
const router = useRouter()

const initialState = parseBrowseQuery(route.query)
const search = ref(initialState.search)
const propertyType = ref(initialState.propertyType)
const listingType = ref(initialState.listingType)
const barangay = ref(initialState.barangay)
const selectedTags = ref<string[]>(initialState.tags)
const minPrice = ref<number | null>(initialState.minPrice)
const maxPrice = ref<number | null>(initialState.maxPrice)
const sort = ref<PropertySort>(initialState.sort)

const types = [
  ALL_TYPES,
  'Office Spaces',
  'Retail Spaces',
  'Warehouses',
  'Commercial Lots',
]

const { properties, loading, error, total, currentPage, lastPage, load } = useProperties()

function readSavedView(): 'grid' | 'map' {
  try {
    return localStorage.getItem(VIEW_KEY) === 'map' ? 'map' : 'grid'
  } catch {
    return 'grid'
  }
}
const resultsView = ref<'grid' | 'map'>(readSavedView())
watch(resultsView, (view) => {
  try {
    localStorage.setItem(VIEW_KEY, view)
  } catch {
    // Remembering the choice is optional.
  }
})
const pinnedCount = computed(() => properties.value.filter((property) => property.latitude != null && property.longitude != null).length)
const suggestedTags = [
  'near port',
  'high-ceiling',
  'flood-free',
  'highway access',
  'corner lot',
  'loading bay',
]
const tagOptions = computed(() => [...new Set([
  ...suggestedTags,
  ...properties.value.flatMap((property) => property.aiTags),
  ...selectedTags.value,
])].sort())

const priceRangeError = computed(() =>
  minPrice.value !== null && maxPrice.value !== null && minPrice.value > maxPrice.value
    ? 'Minimum price must be lower than maximum price.'
    : '',
)

const resultsHeading = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | undefined

function currentFormState(page: number): PropertyBrowseState {
  return {
    search: search.value,
    propertyType: propertyType.value,
    listingType: listingType.value,
    barangay: barangay.value,
    tags: selectedTags.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    sort: sort.value,
    page,
  }
}

function loadFromRoute() {
  const state = parseBrowseQuery(route.query)
  void load({
    search: state.search,
    propertyType: state.propertyType === ALL_TYPES ? undefined : state.propertyType,
    listingType: state.listingType === ALL_LISTINGS ? undefined : state.listingType,
    barangay: state.barangay,
    aiTags: state.tags,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    sort: state.sort,
    page: state.page,
    perPage: PAGE_SIZE,
  })
}

/** The URL is the source of truth: every change to it reloads the results. */
watch(
  () => route.query,
  () => {
    const state = parseBrowseQuery(route.query)
    search.value = state.search
    propertyType.value = state.propertyType
    listingType.value = state.listingType
    barangay.value = state.barangay
    selectedTags.value = state.tags
    minPrice.value = state.minPrice
    maxPrice.value = state.maxPrice
    sort.value = state.sort
    loadFromRoute()
  },
  { immediate: true },
)

/** Form edits update the URL (and reset to page 1) after a short pause. */
watch(
  [search, propertyType, listingType, barangay, selectedTags, minPrice, maxPrice, sort],
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      if (priceRangeError.value) return
      const formQuery = toBrowseQuery(currentFormState(1))
      const routeFilters = toBrowseQuery({ ...parseBrowseQuery(route.query), page: 1 })
      if (isSameQuery(formQuery, routeFilters)) return
      void router.replace({ query: formQuery })
    }, 300)
  },
)

function goToPage(page: number) {
  if (page < 1 || page > lastPage.value || page === currentPage.value) return
  void router.push({ query: toBrowseQuery({ ...parseBrowseQuery(route.query), page }) })
  resultsHeading.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function resetFilters() {
  search.value = ''
  propertyType.value = ALL_TYPES
  listingType.value = ALL_LISTINGS
  barangay.value = ''
  selectedTags.value = []
  minPrice.value = null
  maxPrice.value = null
  sort.value = 'newest'
}

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((selectedTag) => selectedTag !== tag)
    : [...selectedTags.value, tag]
}

function parsePriceInput(event: Event): number | null {
  const value = (event.target as HTMLInputElement).value
  return value === '' ? null : Math.max(0, Number(value))
}

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <main>
    <section class="heading">
      <div class="container">
        <RouterLink to="/" class="back">← Back to Home</RouterLink>
        <h1>Explore Commercial Properties</h1>
        <p>Discover business spaces across Butuan City.</p>
      </div>
    </section>

    <div class="container">
      <AiSearchBar />
    </div>

    <div class="container content">
      <aside class="filters">
        <div class="filter-heading">
          <h2>Filters</h2>
          <button type="button" @click="resetFilters">Reset</button>
        </div>

        <label for="property-search">Search</label>
        <input
          id="property-search"
          v-model="search"
          type="search"
          placeholder="Property or location"
        />

        <label for="property-type">Property Type</label>
        <select id="property-type" v-model="propertyType">
          <option v-for="type in types" :key="type">{{ type }}</option>
        </select>

        <label for="listing-type">Listing Type</label>
        <select id="listing-type" v-model="listingType">
          <option>All Listings</option>
          <option>For Rent</option>
          <option>For Lease</option>
          <option>For Sale</option>
        </select>

        <label for="barangay-filter">Barangay</label>
        <select id="barangay-filter" v-model="barangay">
          <option value="">All barangays</option>
          <option v-for="name in BUTUAN_BARANGAYS" :key="name" :value="name">{{ name }}</option>
        </select>

        <fieldset class="price-filter">
          <legend>Price range (₱)</legend>
          <div class="price-inputs">
            <div>
              <label for="min-price" class="sr-only">Minimum price</label>
              <input
                id="min-price"
                :value="minPrice ?? ''"
                type="number"
                min="0"
                step="1000"
                inputmode="numeric"
                placeholder="Min"
                :aria-invalid="Boolean(priceRangeError)"
                aria-describedby="price-range-error"
                @input="minPrice = parsePriceInput($event)"
              />
            </div>
            <span aria-hidden="true">–</span>
            <div>
              <label for="max-price" class="sr-only">Maximum price</label>
              <input
                id="max-price"
                :value="maxPrice ?? ''"
                type="number"
                min="0"
                step="1000"
                inputmode="numeric"
                placeholder="Max"
                :aria-invalid="Boolean(priceRangeError)"
                aria-describedby="price-range-error"
                @input="maxPrice = parsePriceInput($event)"
              />
            </div>
          </div>
          <p id="price-range-error" class="field-error" role="alert">{{ priceRangeError }}</p>
        </fieldset>

        <fieldset class="tag-filter">
          <legend>Property features</legend>
          <div class="tag-options">
            <button
              v-for="tag in tagOptions"
              :key="tag"
              type="button"
              class="tag-chip"
              :class="{ selected: selectedTags.includes(tag) }"
              :aria-pressed="selectedTags.includes(tag)"
              @click="toggleTag(tag)"
            >
              {{ tag }}
            </button>
          </div>
        </fieldset>
      </aside>

      <section class="results">
        <div ref="resultsHeading" class="results-heading">
          <div>
            <h2>Available Spaces</h2>
            <span>{{ total }} {{ total === 1 ? 'property' : 'properties' }}</span>
          </div>
          <div class="view-toggle" role="group" aria-label="Show results as">
            <button type="button" :aria-pressed="resultsView === 'grid'" @click="resultsView = 'grid'">Grid</button>
            <button type="button" :aria-pressed="resultsView === 'map'" @click="resultsView = 'map'">Map</button>
          </div>
          <div class="sort-control">
            <label for="property-sort">Sort by</label>
            <select id="property-sort" v-model="sort">
              <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>

        <SaveSearchButton />

        <p v-if="loading" class="status-message" role="status">
          Loading properties...
        </p>

        <div v-else-if="error" class="status-message error-message" role="alert">
          <p>Could not load properties: {{ error }}</p>
          <button type="button" @click="loadFromRoute">
            Try Again
          </button>
        </div>

        <div v-else-if="properties.length && resultsView === 'map'" class="map-results">
          <ResultsMap :properties="properties" />
          <p class="map-note">
            Showing {{ pinnedCount }} of {{ properties.length }} listings on this page<template v-if="pinnedCount < properties.length"> (the rest have no map pin yet)</template>.
          </p>
        </div>

        <div v-else-if="properties.length" class="property-grid">
          <PropertyCard
            v-for="property in properties"
            :key="property.id"
            :property="property"
          />
        </div>

        <div v-else class="empty">
          <h3>No properties found</h3>
          <p>Try changing your search or filters.</p>
          <button type="button" @click="resetFilters">Clear Filters</button>
        </div>

        <nav v-if="!loading && !error && properties.length && lastPage > 1" class="pagination" aria-label="Search results pages">
          <button type="button" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
            ← Previous
          </button>
          <span aria-current="page">Page {{ currentPage }} of {{ lastPage }}</span>
          <button type="button" :disabled="currentPage >= lastPage" @click="goToPage(currentPage + 1)">
            Next →
          </button>
        </nav>

      </section>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: auto;
  padding-left: 24px;
  padding-right: 24px;
}

.heading {
  background: #f3f6fb;
  padding: 32px 0 30px;
}

.heading h1 {
  font-size: clamp(30px, 4vw, 43px);
  color: #142d4e;
  margin: 12px 0 6px;
  letter-spacing: -1px;
}

.heading p { margin: 0; color: #5e6d82; }
.back { color: #2563eb; text-decoration: none; font-size: 13px; }

.content {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 30px;
  padding-top: 36px;
  padding-bottom: 90px;
  align-items: start;
}

.filters {
  padding: 25px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.filter-heading, .results-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

h2 { color: #142d4e; font-size: 20px; }
.filter-heading button, .empty button {
  border: 0;
  background: none;
  color: #2563eb;
  cursor: pointer;
}

label {
  display: block;
  margin: 24px 0 9px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.tag-filter {
  min-width: 0;
  padding: 0;
  margin: 24px 0 0;
  border: 0;
}

.tag-filter legend {
  margin-bottom: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-chip {
  min-height: 32px;
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 16px;
  background: white;
  color: #52657b;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  line-height: 1.2;
}

.tag-chip.selected {
  border-color: #2563eb;
  background: #eff6ff;
  color: #075e58;
}

input, select {
  width: 100%;
  padding: 13px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: white;
  color: #334155;
}

.results-heading { margin-bottom: 25px; flex-wrap: wrap; }
.results-heading h2 { margin: 0 0 4px; }

.sort-control { display: flex; align-items: center; gap: 10px; }

.view-toggle {
  display: inline-flex;
  margin-left: auto;
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
}

.view-toggle button {
  padding: 9px 14px;
  border: 0;
  background: #fff;
  color: #334155;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.view-toggle button + button {
  border-left: 1px solid #dbe2ea;
}

.view-toggle button[aria-pressed='true'] {
  background: #142d4e;
  color: #fff;
}

.map-note {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 13px;
}
.sort-control label { margin: 0; white-space: nowrap; }
.sort-control select { width: auto; padding: 10px 12px; }

.price-filter {
  min-width: 0;
  padding: 0;
  margin: 24px 0 0;
  border: 0;
}

.price-filter legend {
  margin-bottom: 10px;
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.price-inputs {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.field-error { min-height: 0; margin: 6px 0 0; color: #b91c1c; font-size: 12px; }
.field-error:empty { display: none; }

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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  color: #334155;
  font-size: 14px;
}

.pagination button {
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: white;
  color: #1d4ed8;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.pagination button:disabled { color: #5e6d82; cursor: not-allowed; }
.results-heading span { color: #5e6d82; font-size: 13px; }
.property-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.empty { text-align: center; padding: 60px 12px; color: #5e6d82; }

@media (max-width: 900px) {
  .content { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .property-grid { grid-template-columns: 1fr; }
}

.status-message {
  padding: 28px 0;
  color: #5e6d82;
}
.status-message.error-message {
  color: #b91c1c;
}
</style>
