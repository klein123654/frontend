<script setup lang="ts">
import { TONE_COLORS, type StatusTone } from '@/utils/availability'

withDefaults(
  defineProps<{
    title: string
    items: { key: string; label: string; tone: StatusTone; description?: string }[]
    /** Show each item's description next to its label. */
    detailed?: boolean
  }>(),
  { detailed: false },
)
</script>

<template>
  <section class="status-legend" :aria-label="title">
    <span class="status-legend__title">{{ title }}</span>
    <ul>
      <li v-for="item in items" :key="item.key" :title="item.description">
        <span class="status-legend__dot" :style="{ background: TONE_COLORS[item.tone].solid }" aria-hidden="true" />
        <strong>{{ item.label }}</strong>
        <span v-if="detailed && item.description" class="status-legend__desc">– {{ item.description }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.status-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 14px;
  font-size: 12px;
  color: #334155;
}

.status-legend__title {
  font-weight: 800;
  color: #142d4e;
  letter-spacing: 0.3px;
}

ul {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}

li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

li strong {
  font-weight: 700;
}

.status-legend__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: none;
}

.status-legend__desc {
  color: #5e6d82;
}
</style>
