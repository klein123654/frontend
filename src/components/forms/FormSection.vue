<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  title: string
  description?: string
}>()
</script>

<template>
  <section class="form-card">
    <div class="section-heading">
      <div class="section-icon">
        <component :is="icon" :size="20" />
      </div>

      <div>
        <h2>{{ title }}</h2>
        <p v-if="description || $slots.description">
          <slot name="description">{{ description }}</slot>
        </p>
      </div>
    </div>

    <slot />
  </section>
</template>

<style scoped>
.form-card {
  padding: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 15px;
  padding-bottom: 23px;
  margin-bottom: 24px;
  border-bottom: 1px solid #edf2f7;
}

.section-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #eaf1fc;
  color: #2563eb;
}

.section-heading h2 {
  margin: 0 0 7px;
  color: #142d4e;
  font-size: 17px;
  font-weight: 750;
}

.section-heading p {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 650px) {
  .form-card {
    padding: 20px 17px;
  }

  .section-heading {
    align-items: flex-start;
  }
}
</style>
