<script setup lang="ts">
import { computed, ref } from 'vue'
import { niceMax, ticks } from './chartScale'

/** One series of columns; the latest column is the accent, the rest a lighter step. */
const props = withDefaults(defineProps<{
  points: { label: string; value: number }[]
  unit?: string
  height?: number
}>(), { unit: '', height: 230 })

const W = 600
const L = 34
const R = 8
const T = 18
const B = 26
const hovered = ref<number | null>(null)
const max = computed(() => niceMax(Math.max(0, ...props.points.map((p) => p.value))))
const plotH = computed(() => props.height - T - B)
const slot = computed(() => (W - L - R) / Math.max(props.points.length, 1))
const barW = computed(() => Math.min(36, slot.value * 0.56))
const bars = computed(() => props.points.map((p, i) => {
  const h = (plotH.value * p.value) / max.value
  const x = L + slot.value * i + (slot.value - barW.value) / 2
  return { ...p, x, y: T + plotH.value - h, h, last: i === props.points.length - 1 }
}))
const peak = computed(() => Math.max(...props.points.map((p) => p.value)))

function path(b: { x: number; y: number; h: number }) {
  const r = Math.min(4, b.h / 2)
  const base = T + plotH.value
  if (b.h <= 0) return ''
  return `M${b.x},${base} V${b.y + r} Q${b.x},${b.y} ${b.x + r},${b.y} H${b.x + barW.value - r} Q${b.x + barW.value},${b.y} ${b.x + barW.value},${b.y + r} V${base} Z`
}
</script>

<template>
  <div class="chart" @mouseleave="hovered = null">
    <svg :viewBox="`0 0 ${W} ${height}`" role="img" :aria-label="points.map((p) => `${p.label}: ${p.value}`).join(', ')">
      <g v-for="t in ticks(max)" :key="t">
        <line :x1="L" :x2="W - R" :y1="T + plotH - (plotH * t) / max" :y2="T + plotH - (plotH * t) / max" :class="t ? 'grid' : 'axis'" />
        <text :x="L - 6" :y="T + plotH - (plotH * t) / max + 4" text-anchor="end" class="tick">{{ Math.round(t) }}</text>
      </g>
      <g v-for="(b, i) in bars" :key="b.label">
        <rect :x="L + slot * i" :y="T" :width="slot" :height="plotH" fill="transparent" @mouseenter="hovered = i" />
        <path :d="path(b)" :class="b.last ? 'bar accent' : 'bar'" :opacity="hovered === null || hovered === i ? 1 : 0.55" />
        <text :x="b.x + barW / 2" :y="height - 8" text-anchor="middle" class="tick">{{ b.label }}</text>
        <text v-if="b.last || (b.value === peak && b.value > 0)" :x="b.x + barW / 2" :y="b.y - 6" text-anchor="middle" class="value">{{ b.value }}</text>
      </g>
    </svg>
    <div v-if="hovered !== null" class="tip" :style="{ left: `${((bars[hovered]!.x + barW / 2) / W) * 100}%` }">
      <strong>{{ points[hovered]!.value }}</strong> {{ unit }}<span>{{ points[hovered]!.label }}</span>
    </div>
  </div>
</template>

<style scoped src="./chart.css"></style>
