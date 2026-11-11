<script setup lang="ts">
import { UserRound } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import PublicContactSettings from '@/components/publisher/PublicContactSettings.vue'
import { useAuth } from '@/composables/useAuth'

// The owner sidebar adapts its links for developer accounts.
const { user } = useAuth()
</script>

<template>
  <AppSidebar role="owner">
    <main class="page">
      <span class="eyebrow">PUBLISHER WORKSPACE</span>
      <h1>Public Profile</h1>
      <p class="intro">Manage how buyers see and contact you on ButuanSpaces.</p>

      <div class="grid">
        <section class="panel">
          <UserRound :size="25" aria-hidden="true" />
          <h2>Account</h2>
          <p><strong>Name:</strong> {{ user?.name }}</p>
          <p><strong>Login email:</strong> {{ user?.email }} <span class="hint">(not shown publicly)</span></p>
          <p><strong>Verified as:</strong> {{ user?.role === 'developer' ? 'Developer' : 'Property owner' }}</p>
        </section>

        <PublicContactSettings />
      </div>
    </main>
  </AppSidebar>
</template>

<style scoped>
.page {
  max-width: 1350px;
  margin: auto;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

h1 {
  margin: 10px 0;
  color: #142d4e;
  font-size: 32px;
}

h2 {
  color: #142d4e;
  font-size: 18px;
}

.intro,
.panel p {
  color: #475569;
  font-size: 13px;
  line-height: 1.8;
}

.hint {
  color: #5e6d82;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 24px;
}

.panel {
  padding: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.panel > svg {
  color: #2563eb;
}

@media (max-width: 700px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
