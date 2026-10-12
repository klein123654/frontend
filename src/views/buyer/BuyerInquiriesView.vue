<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchMySentInquiries, type BackendInquiry } from '@/services/inquiryService'

const inquiries = ref<BackendInquiry[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const response = await fetchMySentInquiries()
    inquiries.value = response.data
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load your inquiries.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="account-page">
    <header class="page-heading"><div><span class="eyebrow">YOUR ACCOUNT</span><h1>My Inquiries</h1><p>Review the messages you sent to property contacts.</p></div><RouterLink to="/properties" class="primary-button">Explore Properties</RouterLink></header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="empty">Loading your inquiries…</p>
    <section v-else-if="inquiries.length" class="inquiry-list" aria-label="Sent inquiries">
      <article v-for="inquiry in inquiries" :key="inquiry.id" class="inquiry-row">
        <div><h2>{{ inquiry.property?.title || 'Property inquiry' }}</h2><p>{{ inquiry.message }}</p><small>Sent {{ inquiry.created_at.slice(0, 10) }}</small></div>
        <div class="status-block"><span class="status" :class="inquiry.status">{{ inquiry.status.replace('_', ' ') }}</span><RouterLink v-if="inquiry.property_id" :to="`/properties/${inquiry.property_id}`">View property</RouterLink></div>
      </article>
    </section>
    <section v-else class="empty"><h2>No inquiries yet</h2><p>When you contact a listing owner or broker, your message will be kept here.</p><RouterLink to="/properties">Browse properties</RouterLink></section>
  </main>
</template>

<style scoped>
.account-page{max-width:1120px;margin:0 auto;padding:46px 24px 80px;color:#142d4e}.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.2px}.page-heading h1{font-size:32px;margin:8px 0}.page-heading p,.inquiry-row p,.empty p{color:#64748b;font-size:14px;line-height:1.7;margin:0}.primary-button{background:#142d4e;color:#fff;padding:13px 17px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700}.inquiry-list{display:grid;gap:14px}.inquiry-row{display:flex;justify-content:space-between;gap:24px;padding:21px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}.inquiry-row h2{font-size:17px;margin:0 0 8px}.inquiry-row small{display:block;margin-top:10px;color:#94a3b8;font-size:12px}.status-block{display:flex;flex-direction:column;align-items:flex-end;gap:14px;white-space:nowrap}.status{padding:7px 10px;border-radius:20px;background:#eff6ff;color:#1d4ed8;text-transform:capitalize;font-size:12px;font-weight:700}.status.in_progress{background:#fef9c3;color:#a16207}.status.resolved{background:#dcfce7;color:#15803d}.status-block a,.empty a{color:#2563eb;font-size:13px;font-weight:700;text-decoration:none}.empty{text-align:center;padding:55px 20px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff}.empty h2{margin:0 0 10px}.empty p{margin-bottom:15px}.error{padding:12px;background:#fef2f2;color:#991b1b;border-radius:8px}@media(max-width:650px){.page-heading,.inquiry-row{align-items:flex-start;flex-direction:column}.primary-button{width:100%;text-align:center}.status-block{align-items:flex-start}}
</style>
