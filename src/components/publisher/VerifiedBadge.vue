<script setup lang="ts">
import { computed } from 'vue'
import { BadgeCheck } from '@lucide/vue'
import type { Publisher } from '@/types/property'

const props = withDefaults(defineProps<{
  publisher: Pick<Publisher, 'verified' | 'role' | 'licenseNumber'>
  /** Compact badges on cards leave out the licence number. */
  compact?: boolean
}>(), { compact: false })

const label = computed(() => {
  if (props.publisher.role === 'broker') return 'PRC-licensed broker'
  if (props.publisher.role === 'developer') return 'Verified developer'
  return 'Verified owner'
})
</script>

<template>
  <span
    v-if="publisher.verified"
    class="verified-badge"
    :class="{ 'verified-badge--compact': compact }"
    :title="publisher.licenseNumber ? `${label} · License ${publisher.licenseNumber}` : label"
  >
    <BadgeCheck :size="compact ? 14 : 16" aria-hidden="true" />
    <span>{{ label }}</span>
    <span v-if="!compact && publisher.licenseNumber" class="verified-badge__license">
      · License {{ publisher.licenseNumber }}
    </span>
  </span>
</template>

<style scoped>
.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
}

.verified-badge--compact {
  padding: 3px 8px;
  font-size: 11px;
}

.verified-badge__license {
  font-weight: 600;
}
</style>
