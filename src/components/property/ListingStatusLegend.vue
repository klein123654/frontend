<script setup lang="ts">
import StatusLegend from '@/components/common/StatusLegend.vue'
import { AVAILABILITY_META, AVAILABILITY_ORDER, REVIEW_STATUS_META, legendItems } from '@/utils/availability'

const review = legendItems(REVIEW_STATUS_META, ['Draft', 'Pending', 'Approved', 'Rejected', 'Needs confirmation'])
const availability = legendItems(AVAILABILITY_META, AVAILABILITY_ORDER)
</script>

<template>
  <div class="listing-legend" data-testid="listing-status-legend">
    <StatusLegend title="Review status:" :items="review" />
    <StatusLegend title="Availability:" :items="availability" />
  </div>
</template>

<style scoped>
.listing-legend {
  display: grid;
  gap: 8px;
  margin: 0 0 14px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}
</style>
