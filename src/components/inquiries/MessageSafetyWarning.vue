<script setup lang="ts">
import { TriangleAlert } from '@lucide/vue'

/** Shown under a received message that looks like a payment scam. */
defineProps<{ reason: string }>()
</script>

<template>
  <div class="safety-warning" role="note">
    <TriangleAlert :size="16" aria-hidden="true" />
    <p>
      <strong>Be careful.</strong> {{ reason }}
      Never send a deposit or reservation fee before you've seen the property and checked the owner's documents.
      <RouterLink to="/report-issue">Report a problem</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.safety-warning {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  background: #fffbeb;
  color: #78350f;
}

.safety-warning svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.safety-warning p {
  margin: 0;
  color: inherit;
  font-size: 12px;
  line-height: 1.6;
}

.safety-warning a {
  color: #92400e;
  font-weight: 700;
}
</style>
