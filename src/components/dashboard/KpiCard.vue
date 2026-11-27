<script setup lang="ts">
/** A headline number that works like a tab: selecting it opens its chart and insight below. */
defineProps<{
  label: string
  value: string | number
  note?: string
  change?: { text: string; up: boolean } | null
  selected: boolean
  controls: string
  hint?: string
}>()
defineEmits<{ select: [] }>()
</script>

<template>
  <button
    type="button"
    role="tab"
    class="kpi"
    :class="{ 'kpi--selected': selected }"
    :aria-selected="selected"
    :aria-controls="controls"
    @click="$emit('select')"
  >
    <span class="kpi__label">{{ label }}</span>
    <span class="kpi__row">
      <strong class="kpi__value">{{ value }}</strong>
      <slot name="spark" />
    </span>
    <span v-if="change" class="kpi__change" :class="change.up ? 'up' : 'down'">{{ change.text }}</span>
    <span v-if="note" class="kpi__note">{{ note }}</span>
    <span class="kpi__hint">{{ selected ? 'Showing below' : hint ?? 'Show details' }}</span>
  </button>
</template>

<style scoped>
.kpi { align-items: stretch; position: relative; display: flex; flex-direction: column; gap: 4px; min-height: 124px; padding: 16px 18px; border: 1px solid #e7ebf0; border-radius: 14px; background: #fff; color: #142d4e; font: inherit; text-align: left; cursor: pointer; transition: border-color .15s, box-shadow .15s; }
.kpi:hover { border-color: #93c5fd; }
.kpi:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
.kpi--selected { border: 2px solid #2563eb; box-shadow: 0 6px 18px #2563eb1f; }
.kpi--selected::after { content: ""; position: absolute; left: 50%; bottom: -11px; width: 18px; height: 18px; background: #fff; border-right: 2px solid #2563eb; border-bottom: 2px solid #2563eb; transform: translateX(-50%) rotate(45deg); }
.kpi__label { color: #5e6d82; font-size: 12.5px; font-weight: 600; }
.kpi__row { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; }
.kpi__value { font-size: 30px; font-weight: 700; letter-spacing: -.5px; line-height: 1.1; }
.kpi__change { font-size: 12px; font-weight: 600; }
.kpi__change.up { color: #15803d; }
.kpi__change.down { color: #b45309; }
.kpi__note { color: #5e6d82; font-size: 12px; }
.kpi__hint { margin-top: auto; padding-top: 4px; color: #64748b; font-size: 11.5px; font-weight: 600; }
.kpi--selected .kpi__hint { color: #2563eb; }
@media (max-width: 700px) {
  .kpi { min-height: 0; padding: 12px 14px; }
  .kpi__value { font-size: 24px; }
  .kpi__row { flex-wrap: wrap; }
}
</style>
