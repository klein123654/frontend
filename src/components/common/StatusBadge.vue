<script setup lang="ts">
import { computed } from 'vue'
import { TONE_COLORS, type StatusTone } from '@/utils/availability'

const props = withDefaults(defineProps<{ label: string; tone: StatusTone; size?: 'sm' | 'md'; title?: string }>(), {
  size: 'sm',
  title: undefined,
})

const colors = computed(() => TONE_COLORS[props.tone])
</script>

<template>
  <span
    class="status-badge"
    :class="[`status-badge--${size}`, `status-badge--${tone}`]"
    :style="{ background: colors.background, color: colors.text }"
    :title="title"
  >
    <span class="status-badge__dot" :style="{ background: colors.solid }" aria-hidden="true" />
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: max-content;
  border-radius: 999px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.status-badge--sm {
  padding: 5px 9px;
  font-size: 11px;
}

.status-badge--md {
  padding: 7px 12px;
  font-size: 13px;
}

.status-badge__dot {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
}
</style>
