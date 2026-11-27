<script setup lang="ts">
import { computed } from 'vue'

/** One labelled row per status, each with its own bar and count, so colour is never the only cue. */
const props = defineProps<{ rows: { label: string; value: number; color: string }[] }>()
const max = computed(() => Math.max(1, ...props.rows.map((r) => r.value)))
</script>

<template>
  <ul class="meters">
    <li v-for="row in rows" :key="row.label">
      <span class="meters__name"><span class="meters__dot" :style="{ background: row.color }" aria-hidden="true" />{{ row.label }}</span>
      <span class="meters__track"><span class="meters__fill" :style="{ width: `${(row.value / max) * 100}%`, background: row.color }" /></span>
      <span class="meters__value">{{ row.value }}</span>
    </li>
  </ul>
</template>

<style scoped src="./chart.css"></style>
