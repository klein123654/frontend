<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ values: number[] }>()
const W = 96
const H = 34
const pts = computed(() => {
  const max = Math.max(...props.values, 1)
  const min = Math.min(...props.values, 0)
  return props.values.map((v, i) => [2 + ((W - 6) * i) / Math.max(props.values.length - 1, 1), H - 4 - ((H - 8) * (v - min)) / (max - min || 1)])
})
</script>

<template>
  <svg v-if="values.length > 1" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true" class="spark">
    <path :d="'M' + pts.map((p) => p.join(',')).join(' L')" />
    <circle :cx="pts.at(-1)![0]" :cy="pts.at(-1)![1]" r="3" />
  </svg>
</template>

<style scoped>
.spark path { fill: none; stroke: #2563eb; stroke-width: 2; stroke-linejoin: round; }
.spark circle { fill: #2563eb; }
</style>
