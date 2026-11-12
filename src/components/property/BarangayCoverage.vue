<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { MapPin } from '@lucide/vue'
import { fetchBarangayCounts, type BarangayCount } from '@/services/propertyService'

const VISIBLE_LIMIT = 12

const counts = ref<BarangayCount[]>([])
const showAll = ref(false)
const visibleCounts = computed(() => (showAll.value ? counts.value : counts.value.slice(0, VISIBLE_LIMIT)))
const totalListings = computed(() => counts.value.reduce((sum, row) => sum + row.count, 0))

onMounted(async () => {
  try {
    counts.value = await fetchBarangayCounts()
  } catch {
    // The section is optional; hide it if the counts can't be loaded.
    counts.value = []
  }
})
</script>

<template>
  <section v-if="counts.length" class="coverage container" aria-labelledby="coverage-heading">
    <div class="coverage__intro">
      <span class="coverage__eyebrow">ACROSS BUTUAN CITY</span>
      <h2 id="coverage-heading">Browse by barangay</h2>
      <p>{{ totalListings }} live {{ totalListings === 1 ? 'listing' : 'listings' }} in {{ counts.length }} {{ counts.length === 1 ? 'barangay' : 'barangays' }}</p>
    </div>

    <ul class="coverage__list">
      <li v-for="row in visibleCounts" :key="row.barangay">
        <RouterLink :to="{ path: '/properties', query: { barangay: row.barangay } }" class="coverage__chip">
          <MapPin :size="14" aria-hidden="true" />
          {{ row.barangay }}
          <span class="coverage__count" :aria-label="`${row.count} listings`">{{ row.count }}</span>
        </RouterLink>
      </li>
    </ul>

    <button v-if="counts.length > VISIBLE_LIMIT" type="button" class="coverage__more" @click="showAll = !showAll">
      {{ showAll ? 'Show fewer' : `Show all ${counts.length} barangays` }}
    </button>
  </section>
</template>

<style scoped>
.coverage {
  padding-block: 40px;
}

.coverage__eyebrow {
  color: #066b63;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

h2 {
  margin: 8px 0 4px;
  color: #142d4e;
  font-size: clamp(22px, 3vw, 28px);
}

.coverage__intro p {
  margin: 0;
  color: #475569;
  font-size: 14px;
}

.coverage__list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.coverage__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #ffffff;
  color: #142d4e;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.coverage__chip:hover {
  border-color: #066b63;
  color: #066b63;
}

.coverage__count {
  padding: 2px 8px;
  border-radius: 999px;
  background: #e6f5f2;
  color: #075e58;
  font-size: 12px;
  font-weight: 800;
}

.coverage__more {
  margin-top: 14px;
  padding: 0;
  border: 0;
  background: none;
  color: #1d4ed8;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
