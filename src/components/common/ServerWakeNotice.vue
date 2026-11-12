<script setup lang="ts">
import { isServerWakingUp } from '@/services/serverStatus'
</script>

<template>
  <div class="server-wake-notice" aria-live="polite" aria-atomic="true">
    <p v-if="isServerWakingUp" class="server-wake-notice__message">
      <span class="server-wake-notice__spinner" aria-hidden="true"></span>
      The server is waking up. This can take up to a minute on the first visit.
    </p>
  </div>
</template>

<style scoped>
.server-wake-notice {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: calc(100% - 32px);
}

.server-wake-notice__message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 12px 18px;
  border-radius: 10px;
  background: #142d4e;
  color: #ffffff;
  font-size: 0.9rem;
  box-shadow: 0 8px 24px rgba(20, 45, 78, 0.25);
}

.server-wake-notice__spinner {
  flex: none;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: server-wake-spin 0.8s linear infinite;
}

@keyframes server-wake-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .server-wake-notice__spinner {
    animation: none;
  }
}
</style>
