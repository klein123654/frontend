<script setup lang="ts">
import { computed } from 'vue'

/** Horizontal bars on one baseline, one hue; the largest value is the accent. */
const props = withDefaults(defineProps<{
  rows: { label: string; value: number; sub?: string }[]
  format?: (value: number) => string
}>(), { format: (v: number) => String(v) })

const max = computed(() => Math.max(0, ...props.rows.map((r) => r.value)))
</script>

<template>
  <ul class="ranked">
    <li v-for="row in rows" :key="row.label" :title="`${row.label}: ${format(row.value)}`">
      <span class="ranked__name">{{ row.label }}<small v-if="row.sub">{{ row.sub }}</small></span>
      <span class="ranked__track"><span class="ranked__bar" :class="{ accent: row.value === max && max > 0 }" :style="{ width: `${max ? Math.max((row.value / max) * 100, row.value ? 2 : 0) : 0}%` }" /></span>
      <span class="ranked__value">{{ format(row.value) }}</span>
    </li>
  </ul>
</template>

<style scoped src="./chart.css"></style>
