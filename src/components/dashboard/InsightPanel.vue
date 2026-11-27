<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sparkles } from '@lucide/vue'
import { fetchCardInsight, insightCache as cache, type CardInsight, type DashboardPeriod } from '@/services/dashboardService'

/**
 * Panel under the selected card: its chart on the left, and 2-3 points about
 * it on the right. The points are worded by AI from figures the system computed.
 */
const props = defineProps<{
  id: string
  title: string
  subtitle: string
  scope: 'publisher' | 'admin'
  metric: string
  days: DashboardPeriod
}>()

const insight = ref<CardInsight | null>(null)
const loading = ref(false)
const failed = ref(false)

async function load() {
  const key = `${props.scope}:${props.metric}:${props.days}`
  if (cache.has(key)) { insight.value = cache.get(key)!; return }
  loading.value = true
  failed.value = false
  insight.value = null
  try {
    const result = await fetchCardInsight(props.scope, props.metric, props.days)
    cache.set(key, result)
    if (`${props.scope}:${props.metric}:${props.days}` === key) insight.value = result
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

watch(() => [props.metric, props.days], load, { immediate: true })
</script>

<template>
  <section :id="id" class="panel" role="tabpanel" :aria-label="title">
    <div class="panel__chart">
      <h3>{{ title }}</h3>
      <p class="panel__sub">{{ subtitle }}</p>
      <slot />
    </div>
    <aside class="panel__insight" aria-live="polite">
      <span class="panel__label"><Sparkles :size="13" aria-hidden="true" />{{ insight && !insight.ai_written ? 'Summary' : 'AI insight' }}</span>
      <ul v-if="loading" class="panel__loading" aria-label="Loading insight"><li /><li /><li /></ul>
      <ul v-else-if="insight && insight.bullets.length"><li v-for="point in insight.bullets" :key="point">{{ point }}</li></ul>
      <p v-else-if="failed" class="panel__muted">The insight could not be loaded. The chart still shows every figure.</p>
      <p v-else class="panel__muted">Not enough activity in this period yet.</p>
      <p class="panel__foot">{{ insight && !insight.ai_written ? 'Written from the figures computed by ButuanSpaces.' : 'Figures computed by ButuanSpaces; the AI only puts them into words.' }}</p>
      <slot name="extra" />
    </aside>
  </section>
</template>

<style scoped>
.panel { display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 24px; margin: 4px 0 22px; padding: 20px 22px; border: 2px solid #2563eb; border-radius: 14px; background: #fff; }
h3 { margin: 0; font-size: 16px; color: #142d4e; }
.panel__sub { margin: 3px 0 12px; color: #5e6d82; font-size: 12.5px; }
.panel__insight { padding: 14px 16px; border: 1px solid #dbeafe; border-radius: 12px; background: linear-gradient(180deg, #f8fbff, #fff); min-width: 0; }
.panel__label { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; font-size: 11px; font-weight: 800; letter-spacing: .9px; text-transform: uppercase; }
ul { margin: 8px 0 0; padding-left: 18px; color: #1e3a5f; font-size: 13px; line-height: 1.6; }
li { margin-bottom: 6px; }
.panel__loading { list-style: none; padding: 0; }
.panel__loading li { height: 12px; margin: 10px 0; border-radius: 6px; background: linear-gradient(90deg, #eef2f7, #f8fafc, #eef2f7); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
.panel__loading li:nth-child(2) { width: 85%; } .panel__loading li:nth-child(3) { width: 60%; }
@keyframes shimmer { to { background-position: -200% 0; } }
@media (prefers-reduced-motion: reduce) { .panel__loading li { animation: none; } }
.panel__muted { margin: 8px 0 0; color: #5e6d82; font-size: 13px; }
.panel__foot { margin: 6px 0 0; color: #64748b; font-size: 11px; }
@media (max-width: 900px) { .panel { grid-template-columns: 1fr; padding: 16px; } }
</style>
