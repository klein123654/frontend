<script setup lang="ts">
import { computed } from 'vue'

/** Each row: the market range (grey), its median (tick) and this listing (blue dot). */
const props = withDefaults(defineProps<{
  rows: { label: string; sub: string; min: number; median: number; max: number; value: number }[]
  format?: (value: number) => string
}>(), { format: (v: number) => String(v) })

const hi = computed(() => Math.max(1, ...props.rows.flatMap((r) => [r.max, r.value])) * 1.08)
const pct = (v: number) => `${(v / hi.value) * 100}%`
</script>

<template>
  <div class="range">
    <div class="range__legend">
      <span><span class="range__you" aria-hidden="true" />Your listing</span>
      <span><span class="range__swatch" aria-hidden="true" />Range of similar listings</span>
      <span><span class="range__tick-key" aria-hidden="true" />Median</span>
    </div>
    <ul>
      <li v-for="row in rows" :key="row.label" :title="`${row.label}: ${format(row.value)} (similar listings ${format(row.min)}–${format(row.max)}, median ${format(row.median)})`">
        <span class="range__name">{{ row.label }}<small>{{ row.sub }}</small></span>
        <span class="range__plot">
          <span class="range__band" :style="{ left: pct(row.min), width: `calc(${pct(row.max)} - ${pct(row.min)})` }" />
          <span class="range__median" :style="{ left: pct(row.median) }" />
          <span class="range__dot" :style="{ left: pct(row.value) }" />
        </span>
        <span class="range__value">{{ format(row.value) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped src="./chart.css"></style>
