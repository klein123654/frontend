<script setup lang="ts">
import { RouterLink } from 'vue-router'

/** To-do chips at the top of a dashboard; each opens the page where the item is handled. */
defineProps<{
  title: string
  items: { text: string; to: string; tone: 'warn' | 'info' | 'bad' }[]
}>()
</script>

<template>
  <div v-if="items.length" class="attention" role="region" :aria-label="title">
    <strong>{{ title }}</strong>
    <RouterLink v-for="item in items" :key="item.text" :to="item.to" class="chip" :class="`chip--${item.tone}`">{{ item.text }} →</RouterLink>
  </div>
  <div v-else class="attention attention--clear" role="status"><strong>{{ title }}</strong><span>You’re all caught up.</span></div>
</template>

<style scoped>
.attention { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 18px; padding: 12px 14px; border: 1px solid #e7ebf0; border-radius: 14px; background: #fff; }
strong { font-size: 13px; color: #142d4e; margin-right: 4px; }
.attention--clear span { color: #15803d; font-size: 13px; font-weight: 600; }
.chip { display: inline-flex; padding: 7px 11px; border-radius: 999px; font-size: 12.5px; font-weight: 600; text-decoration: none; }
.chip--warn { background: #fef3c7; color: #92400e; }
.chip--info { background: #dbeafe; color: #1e40af; }
.chip--bad { background: #fee2e2; color: #991b1b; }
.chip:focus-visible { outline: 3px solid #93c5fd; outline-offset: 2px; }
</style>
