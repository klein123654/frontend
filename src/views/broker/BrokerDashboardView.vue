<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import PublisherDashboard from '@/components/dashboard/PublisherDashboard.vue'
import { useBrokerVerification } from '@/composables/useBrokerVerification'

const { canManageListings, verificationLoading, blockedMessage } = useBrokerVerification()
</script>

<template>
  <AppSidebar role="broker">
    <div v-if="!verificationLoading && !canManageListings" class="verification-warning" role="status">{{ blockedMessage }}</div>
    <PublisherDashboard role="broker" />
  </AppSidebar>
</template>

<style scoped>
.verification-warning { max-width: 1240px; margin: 0 auto 18px; padding: 14px 18px; border: 1px solid #fcd34d; border-radius: 8px; background: #fffbeb; color: #92400e; font-size: 13px; line-height: 1.6; }
</style>
