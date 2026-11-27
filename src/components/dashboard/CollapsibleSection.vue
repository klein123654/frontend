<script setup lang="ts">
import { ref, watch } from 'vue'
import { ChevronDown } from '@lucide/vue'

/** A section that starts closed to keep the dashboard short; its summary still shows the key figure. */
const props = withDefaults(defineProps<{
  id: string
  title: string
  summary?: string
  defaultOpen?: boolean
}>(), { summary: '', defaultOpen: false })

const storageKey = `butuanspaces_dashboard_section:${props.id}`
function initial(): boolean {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved === null ? props.defaultOpen : saved === '1'
  } catch {
    return props.defaultOpen
  }
}
const open = ref(initial())
watch(open, (value) => {
  try { localStorage.setItem(storageKey, value ? '1' : '0') } catch { /* remembering is optional */ }
})
</script>

<template>
  <section class="collapsible" :class="{ 'collapsible--open': open }">
    <h2>
      <button type="button" class="collapsible__head" :aria-expanded="open" :aria-controls="`${id}-body`" @click="open = !open">
        <span class="collapsible__title">{{ title }}</span>
        <span v-if="summary" class="collapsible__summary">{{ summary }}</span>
        <ChevronDown :size="18" class="collapsible__chevron" aria-hidden="true" />
      </button>
    </h2>
    <div v-show="open" :id="`${id}-body`" class="collapsible__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.collapsible { margin-bottom: 14px; border: 1px solid #e7ebf0; border-radius: 14px; background: #fff; }
h2 { margin: 0; font-size: inherit; }
.collapsible__head { display: flex; align-items: center; gap: 12px; width: 100%; padding: 16px 20px; border: 0; background: none; color: #142d4e; font: inherit; text-align: left; cursor: pointer; border-radius: 14px; justify-content: flex-start; }
.collapsible__head:focus-visible { outline: 3px solid #93c5fd; outline-offset: -3px; }
.collapsible__title { font-size: 16px; font-weight: 700; }
.collapsible__summary { color: #5e6d82; font-size: 13px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.collapsible__chevron { flex: none; margin-left: auto; color: #5e6d82; transition: transform .2s; }
.collapsible--open .collapsible__chevron { transform: rotate(180deg); }
.collapsible__body { padding: 0 20px 20px; }
@media (max-width: 600px) { .collapsible__summary { display: none; } }
</style>
