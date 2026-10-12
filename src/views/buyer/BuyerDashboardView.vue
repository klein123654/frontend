<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuth } from '@/composables/useAuth'
import { fetchSavedProperties, removeSavedProperty } from '@/services/savedPropertyService'
import { fetchMyInquiries, type BackendInquiry } from '@/services/inquiryService'
import type { OwnerProperty } from '@/data/owner/ownerProperties'

const { user } = useAuth()
const savedProperties = ref<OwnerProperty[]>([])
const inquiries = ref<BackendInquiry[]>([])
const error = ref('')

onMounted(async () => {
  try {
    const [saved, inbox] = await Promise.all([fetchSavedProperties(), fetchMyInquiries()])
    savedProperties.value = saved
    inquiries.value = inbox.data
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load account data.'
  }
})

async function removeSaved(id: number) {
  error.value = ''
  try {
    await removeSavedProperty(id)
    savedProperties.value = savedProperties.value.filter((item) => item.id !== id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to remove this property.'
  }
}
</script>

<template>
  <AppSidebar role="buyer">
    <main class="buyer-dashboard">
      <header class="page-heading">
        <div>
          <span class="eyebrow">BUYER WORKSPACE</span>
          <h1>Dashboard</h1>
          <p>Track your saved properties and follow up on your inquiries.</p>
        </div>
        <RouterLink to="/buyer/properties" class="primary-button">Explore Properties</RouterLink>
      </header>

      <p v-if="error" class="load-error" role="alert">{{ error }}</p>

      <section class="summary-grid" aria-label="Account summary">
        <article class="summary-card">
          <span>Saved properties</span>
          <strong>{{ savedProperties.length }}</strong>
          <small>Properties you want to revisit</small>
        </article>
        <article class="summary-card">
          <span>My inquiries</span>
          <strong>{{ inquiries.length }}</strong>
          <small>Messages sent to listing contacts</small>
        </article>
        <article class="summary-card">
          <span>Account status</span>
          <strong class="account-status">{{ user?.account_status || '—' }}</strong>
          <small>{{ user?.email || 'Buyer account' }}</small>
        </article>
      </section>

      <section class="workspace-grid">
        <article id="saved-properties" class="workspace-panel">
          <header class="panel-heading">
            <div>
              <h2>Saved properties</h2>
              <p>Your shortlist</p>
            </div>
            <RouterLink to="/buyer/properties">Find properties</RouterLink>
          </header>
          <ul v-if="savedProperties.length" class="record-list">
            <li v-for="property in savedProperties" :key="property.id">
              <RouterLink :to="`/buyer/properties/${property.id}`" class="record-link">
                <strong>{{ property.title }}</strong>
                <small>{{ property.location || 'Location not specified' }}</small>
              </RouterLink>
              <button type="button" @click="removeSaved(property.id)">Remove</button>
            </li>
          </ul>
          <div v-else class="empty-state">
            <h3>Your shortlist is empty</h3>
            <p>Save a property to keep it here for your next visit.</p>
            <RouterLink to="/buyer/properties">Browse properties</RouterLink>
          </div>
        </article>

        <article class="workspace-panel">
          <header class="panel-heading">
            <div>
              <h2>My inquiries</h2>
              <p>Recent messages to listing contacts</p>
            </div>
          </header>
          <ul v-if="inquiries.length" class="record-list">
            <li v-for="inquiry in inquiries" :key="inquiry.id">
              <RouterLink :to="`/buyer/properties/${inquiry.property_id}`" class="record-link">
                <strong>{{ inquiry.property?.title || 'Property inquiry' }}</strong>
                <small>{{ inquiry.status.replace('_', ' ') }} · {{ inquiry.created_at.slice(0, 10) }}</small>
              </RouterLink>
            </li>
          </ul>
          <div v-else class="empty-state">
            <h3>No inquiries yet</h3>
            <p>When you contact a listing owner or broker, your inquiry will appear here.</p>
            <RouterLink to="/buyer/properties">Explore properties</RouterLink>
          </div>
        </article>
      </section>
    </main>
  </AppSidebar>
</template>

<style scoped>
.buyer-dashboard { width: min(1320px, 100%); margin: 0 auto; padding: 38px clamp(20px, 4vw, 52px) 64px; color: #142d4e; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.eyebrow { color: #2563eb; font-size: 11px; font-weight: 800; letter-spacing: 1.3px; }
h1 { margin: 8px 0; font-size: clamp(28px, 3vw, 36px); letter-spacing: -0.8px; }
.page-heading p, .panel-heading p { margin: 0; color: #64748b; font-size: 14px; line-height: 1.6; }
.primary-button { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 18px; border-radius: 9px; background: #142d4e; color: white; text-decoration: none; font-size: 13px; font-weight: 700; white-space: nowrap; }
.primary-button:hover { background: #2563eb; }
.load-error { padding: 13px 16px; margin: 0 0 20px; border: 1px solid #fecaca; border-radius: 9px; background: #fef2f2; color: #991b1b; }
.summary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-bottom: 22px; }
.summary-card, .workspace-panel { min-width: 0; border: 1px solid #e2e8f0; border-radius: 13px; background: white; box-shadow: 0 2px 8px #142d4e05; }
.summary-card { display: flex; flex-direction: column; gap: 8px; padding: 21px 23px; }
.summary-card > span { color: #64748b; font-size: 13px; font-weight: 600; }
.summary-card strong { color: #142d4e; font-size: 30px; line-height: 1.1; }
.summary-card strong.account-status { font-size: 20px; text-transform: capitalize; }
.summary-card small { color: #94a3b8; font-size: 12px; }
.workspace-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; gap: 18px; }
.workspace-panel { padding: 23px; }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding-bottom: 18px; border-bottom: 1px solid #edf0f5; }
.panel-heading h2 { margin: 0 0 5px; color: #142d4e; font-size: 18px; }
.panel-heading a, .empty-state a { color: #2563eb; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
.record-list { display: grid; gap: 0; margin: 0; padding: 0; list-style: none; }
.record-list li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 15px 0; border-bottom: 1px solid #edf0f5; }
.record-list li:last-child { border-bottom: 0; }
.record-link { display: flex; flex-direction: column; gap: 5px; min-width: 0; color: #142d4e; text-decoration: none; }
.record-link:hover strong { color: #2563eb; }
.record-link strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.record-link small { color: #64748b; font-size: 11px; text-transform: capitalize; }
.record-list button { border: 0; background: transparent; color: #b91c1c; font: inherit; font-size: 12px; cursor: pointer; }
.empty-state { padding: 28px 10px 10px; }
.empty-state h3 { margin: 0 0 7px; color: #334155; font-size: 15px; }
.empty-state p { margin: 0 0 15px; color: #64748b; font-size: 13px; line-height: 1.6; }
@media (max-width: 800px) { .summary-grid { grid-template-columns: 1fr 1fr; } .workspace-grid { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .buyer-dashboard { padding-top: 26px; } .page-heading { align-items: stretch; flex-direction: column; } .primary-button { width: 100%; } .summary-grid { grid-template-columns: 1fr; } }
</style>
