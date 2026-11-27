<script setup lang="ts">
import { computed, ref } from 'vue'
import { niceMax, ticks } from './chartScale'

/** One series over time: 2px line, light area, crosshair tooltip, end label. */
const props = withDefaults(defineProps<{
  points: { label: string; value: number }[]
  unit?: string
  height?: number
  /** Show every Nth x label. */
  labelEvery?: number
}>(), { unit: '', height: 230, labelEvery: 1 })

const W = 600
const L = 34
const R = 26
const T = 20
const B = 26
const hovered = ref<number | null>(null)
const max = computed(() => niceMax(Math.max(0, ...props.points.map((p) => p.value))))
const plotH = computed(() => props.height - T - B)
const xy = computed(() => props.points.map((p, i) => ({
  x: L + ((W - L - R) * i) / Math.max(props.points.length - 1, 1),
  y: T + plotH.value - (plotH.value * p.value) / max.value,
})))
const linePath = computed(() => 'M' + xy.value.map((p) => `${p.x},${p.y}`).join(' L'))
const areaPath = computed(() => {
  const pts = xy.value
  if (!pts.length) return ''
  return `${linePath.value} L${pts.at(-1)!.x},${T + plotH.value} L${pts[0]!.x},${T + plotH.value} Z`
})

function onMove(event: MouseEvent) {
  const svg = event.currentTarget as SVGSVGElement
  const box = svg.getBoundingClientRect()
  const x = ((event.clientX - box.left) / box.width) * W
  let best = 0
  xy.value.forEach((p, i) => { if (Math.abs(p.x - x) < Math.abs(xy.value[best]!.x - x)) best = i })
  hovered.value = best
}
</script>

<template>
  <div class="chart" @mouseleave="hovered = null">
    <svg :viewBox="`0 0 ${W} ${height}`" role="img" :aria-label="`${points.length} values, latest ${points.at(-1)?.value ?? 0}`" @mousemove="onMove">
      <g v-for="t in ticks(max)" :key="t">
        <line :x1="L" :x2="W - R" :y1="T + plotH - (plotH * t) / max" :y2="T + plotH - (plotH * t) / max" :class="t ? 'grid' : 'axis'" />
        <text :x="L - 6" :y="T + plotH - (plotH * t) / max + 4" text-anchor="end" class="tick">{{ Math.round(t) }}</text>
      </g>
      <path :d="areaPath" class="area" />
      <path :d="linePath" class="line" />
      <template v-for="(p, i) in points" :key="i">
        <text v-if="i % labelEvery === 0 || i === points.length - 1" :x="xy[i]!.x" :y="height - 8" text-anchor="middle" class="tick">{{ p.label }}</text>
      </template>
      <line v-if="hovered !== null" :x1="xy[hovered]!.x" :x2="xy[hovered]!.x" :y1="T" :y2="T + plotH" class="cross" />
      <circle v-if="hovered !== null" :cx="xy[hovered]!.x" :cy="xy[hovered]!.y" r="5" class="dot" />
      <template v-if="xy.length">
        <circle :cx="xy.at(-1)!.x" :cy="xy.at(-1)!.y" r="5" class="dot" />
        <text :x="xy.at(-1)!.x - 8" :y="xy.at(-1)!.y - 10" text-anchor="end" class="value">{{ points.at(-1)!.value }}</text>
      </template>
    </svg>
    <div v-if="hovered !== null" class="tip" :style="{ left: `${(xy[hovered]!.x / W) * 100}%` }">
      <strong>{{ points[hovered]!.value }}</strong> {{ unit }}<span>{{ points[hovered]!.label }}</span>
    </div>
  </div>
</template>

<style scoped src="./chart.css"></style>
