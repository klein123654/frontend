<script setup lang="ts">
import { computed } from 'vue'
import { BadgeCheck, TriangleAlert } from '@lucide/vue'
import type { Publisher } from '@/types/property'

const props = withDefaults(defineProps<{
  publisher: Pick<Publisher, 'verified' | 'role' | 'licenseNumber'> & Partial<Pick<Publisher, 'broker'>>
  /** Compact badges on cards leave out the licence number. */
  compact?: boolean
}>(), { compact: false })

/** A broker whose PRC licence or DHSUD registration lapsed after being verified. */
const renewing = computed(() =>
  props.publisher.role === 'broker'
  && !props.publisher.verified
  && ['expired', 'missing'].includes(props.publisher.broker?.credentialStatus ?? ''),
)

const label = computed(() => {
  if (renewing.value) return 'Registration being renewed'
  if (props.publisher.role === 'broker') return 'Verified broker'
  return 'Verified owner'
})

const title = computed(() => {
  if (renewing.value) return 'This broker’s PRC license or DHSUD registration has expired and is being renewed.'
  if (props.publisher.role === 'broker') return 'PRC license and DHSUD registration checked by ButuanSpaces and currently valid.'
  return label.value
})
</script>

<template>
  <span
    v-if="publisher.verified || renewing"
    class="verified-badge"
    :class="{ 'verified-badge--compact': compact, 'verified-badge--renewing': renewing }"
    :title="title"
  >
    <TriangleAlert v-if="renewing" :size="compact ? 14 : 16" aria-hidden="true" />
    <BadgeCheck v-else :size="compact ? 14 : 16" aria-hidden="true" />
    <span>{{ label }}</span>
    <span v-if="!compact && !renewing && publisher.licenseNumber" class="verified-badge__license">
      · PRC {{ publisher.licenseNumber }}
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

.verified-badge--renewing {
  background: #fef3c7;
  color: #92400e;
}

.verified-badge--compact {
  padding: 3px 8px;
  font-size: 11px;
}

.verified-badge__license {
  font-weight: 600;
}
</style>
