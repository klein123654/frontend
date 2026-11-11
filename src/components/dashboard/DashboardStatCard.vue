<script setup lang="ts">
defineProps<{
  label: string
  /** Two-digit marker shown in the corner, e.g. "01". */
  marker: string
  value: number
  note: string
}>()
</script>

<template>
  <article class="stat-card">
    <div class="stat-top">
      <span>{{ label }}</span>
      <span class="stat-icon" aria-hidden="true">{{ marker }}</span>
    </div>

    <strong>{{ value }}</strong>

    <small>{{ note }}</small>
  </article>
</template>

<style scoped>
.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 23px;
  min-width: 0;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.stat-top > span:first-child {
  color: #5e6d82;
  font-size: 12px;
  font-weight: 600;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
}

.stat-card > strong {
  display: block;
  color: #142d4e;
  font-size: 31px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-card small {
  color: #5e6d82;
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .stat-card {
    padding: 17px;
  }

  .stat-card > strong {
    font-size: 26px;
  }
}
</style>
