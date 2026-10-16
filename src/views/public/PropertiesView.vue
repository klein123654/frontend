<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useProperties } from '@/composables/useProperties'
import PropertyCard from '@/components/property/PropertyCard.vue'

const route = useRoute()

const getQuery = (value: unknown) =>
  typeof value === 'string' ? value : ''

const search = ref(getQuery(route.query.search))
const propertyType = ref(getQuery(route.query.type) || 'All Types')
const listingType = ref('All Listings')

const types = [
  'All Types',
  'Office Spaces',
  'Retail Spaces',
  'Warehouses',
  'Commercial Lots',
]

const { properties, loading, error, total, load } = useProperties()

let debounceTimer: ReturnType<typeof setTimeout> | undefined

function loadWithCurrentFilters() {
  void load({
    search: search.value,
    propertyType:
      propertyType.value === 'All Types' ? undefined : propertyType.value,
    listingType:
      listingType.value === 'All Listings' ? undefined : listingType.value,
  })
}

watch(
  () => route.query,
  (query) => {
    search.value = getQuery(query.search)
    propertyType.value = getQuery(query.type) || 'All Types'
  },
)

watch(
  [search, propertyType, listingType],
  () => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(loadWithCurrentFilters, 300)
  },
  { immediate: true },
)

function resetFilters() {
  search.value = ''
  propertyType.value = 'All Types'
  listingType.value = 'All Listings'
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
      </aside>

      <section class="results">
        <div class="results-heading">
          <h2>Available Spaces</h2>
          <span>{{ total }} properties</span>
        </div>

        <p v-if="loading" class="status-message" role="status">
          Loading properties...
        </p>

        <div v-else-if="error" class="status-message error-message" role="alert">
          <p>Could not load properties: {{ error }}</p>
          <button type="button" @click="loadWithCurrentFilters">
            Try Again
          </button>
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
  padding: 65px 0;
}

.heading h1 {
  font-size: clamp(30px, 4vw, 43px);
  color: #142d4e;
  margin: 18px 0 10px;
  letter-spacing: -1px;
}

.heading p { color: #64748b; }
.back { color: #2563eb; text-decoration: none; font-size: 13px; }

.content {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 30px;
  padding-top: 55px;
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

input, select {
  width: 100%;
  padding: 13px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: white;
  color: #334155;
}

.results-heading { margin-bottom: 25px; }
.results-heading span { color: #64748b; font-size: 13px; }
.property-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
.empty { text-align: center; padding: 60px 12px; color: #64748b; }

@media (max-width: 900px) {
  .content { grid-template-columns: 1fr; }
}

@media (max-width: 600px) {
  .property-grid { grid-template-columns: 1fr; }
}

.status-message {
  padding: 28px 0;
  color: #64748b;
}
.status-message.error-message {
  color: #b91c1c;
}
</style>
