<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { availabilityState, type WorkspaceListingStatus } from '@/utils/listingRules'
import type { ListingAvailability } from '@/types/property'

const props = defineProps<{
  listings: { id: number; title: string; status: WorkspaceListingStatus; availability: ListingAvailability; availabilityConfirmedAt: string | null }[]
  /** Path prefix for a listing's details page, e.g. "/owner/properties". */
  detailsBase: string
}>()

const needsAttention = computed(() =>
  props.listings.filter((listing) => {
    const state = availabilityState(listing)
    return state === 'needs-confirmation' || state === 'hidden-unconfirmed'
  }),
)
</script>

<template>
  <div v-if="needsAttention.length" class="attention" role="status">
    <strong>
      {{ needsAttention.length === 1 ? '1 listing needs' : `${needsAttention.length} listings need` }}
      your confirmation that it’s still available.
    </strong>
    <span>Unconfirmed listings are hidden from the public after 60 days.</span>
    <ul>
      <li v-for="listing in needsAttention.slice(0, 5)" :key="listing.id">
        <RouterLink :to="`${detailsBase}/${listing.id}`">{{ listing.title }}</RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.attention {
  display: grid;
  gap: 4px;
  margin-bottom: 20px;
  padding: 14px 16px;
  border: 1px solid #fde68a;
  border-radius: 10px;
  background: #fffbeb;
  color: #92400e;
  font-size: 14px;
}

ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

a {
  color: #92400e;
  font-weight: 600;
}
</style>
