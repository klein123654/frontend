<script setup lang="ts">
import { ref } from 'vue'

/** A card holding one chart, with a table view of the same figures. */
defineProps<{
  title: string
  subtitle?: string
  columns: string[]
  rows: (string | number)[][]
}>()
const showTable = ref(false)
</script>

<template>
  <div class="chart-card">
    <div class="chart-card__head">
      <div><h3>{{ title }}</h3><p v-if="subtitle">{{ subtitle }}</p></div>
      <button type="button" class="chart-card__toggle" :aria-pressed="showTable" @click="showTable = !showTable">{{ showTable ? 'Chart view' : 'Table view' }}</button>
    </div>
    <table v-if="showTable">
      <thead><tr><th v-for="column in columns" :key="column">{{ column }}</th></tr></thead>
      <tbody><tr v-for="(row, i) in rows" :key="i"><td v-for="(cell, j) in row" :key="j">{{ cell }}</td></tr></tbody>
    </table>
    <slot v-else />
    <slot name="note" />
  </div>
</template>

<style scoped>
.chart-card { min-width: 0; padding: 18px 20px; border: 1px solid #e7ebf0; border-radius: 14px; background: #fff; }
.chart-card__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
h3 { margin: 0; font-size: 15px; color: #142d4e; }
p { margin: 3px 0 0; color: #5e6d82; font-size: 12.5px; }
.chart-card__toggle { flex: none; padding: 0; border: 0; background: none; color: #1d4ed8; font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer; }
.chart-card table { width: 100%; min-width: 0; border-collapse: collapse; font-size: 13px; }
th { text-align: left; color: #5e6d82; font-weight: 600; font-size: 12px; padding: 6px; border-bottom: 1px solid #e7ebf0; }
td { padding: 7px 6px; border-bottom: 1px solid #f1f4f8; font-variant-numeric: tabular-nums; }
</style>
