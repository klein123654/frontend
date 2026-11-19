<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import { AVAILABILITY_META } from '@/utils/availability'
import type { ListingAvailability } from '@/types/property'

const props = withDefaults(defineProps<{ availability?: ListingAvailability; size?: 'sm' | 'md' }>(), {
  availability: 'available',
  size: 'sm',
})

const meta = computed(() => AVAILABILITY_META[props.availability] ?? AVAILABILITY_META.available)
</script>

<template>
  <StatusBadge :label="meta.label" :tone="meta.tone" :size="size" :title="meta.description" data-testid="availability-badge" />
</template>
