<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import AvailabilityBadge from '@/components/common/AvailabilityBadge.vue'
import { REVIEW_STATUS_META } from '@/utils/availability'
import { availabilityState, type WorkspaceListingStatus } from '@/utils/listingRules'
import type { ListingAvailability } from '@/types/property'

const props = defineProps<{
  listing: { status: WorkspaceListingStatus; availability: ListingAvailability; availabilityConfirmedAt: string | null }
}>()

const review = computed(() => {
  const state = availabilityState(props.listing)
  const key = state === 'needs-confirmation' || state === 'hidden-unconfirmed' ? 'Needs confirmation' : props.listing.status
  return REVIEW_STATUS_META[key]
})
</script>

<template>
  <span class="listing-status">
    <StatusBadge :label="review.label" :tone="review.tone" :title="review.description" data-testid="review-status" />
    <AvailabilityBadge v-if="listing.status === 'Approved'" :availability="listing.availability" />
  </span>
</template>

<style scoped>
.listing-status {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>
