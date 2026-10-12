<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchPublisherApplication, submitPublisherApplication, type PublisherApplication, type PublisherRole } from '@/services/publisherApplicationService'
import { useFormDraft } from '@/composables/useFormDraft'

const application = ref<PublisherApplication | null>(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const roleOptions: { value: PublisherRole; label: string }[] = [
  { value: 'owner', label: 'Property Owner' },
  { value: 'broker', label: 'Licensed Broker' },
  { value: 'developer', label: 'Property Developer' },
]
const form = reactive({ role: 'owner' as PublisherRole, ownershipType: 'individual', businessName: '', licenseNumber: '', agencyName: '' })
const formDraft = useFormDraft('publisher-application', form)

async function load() {
  try {
    const response = await fetchPublisherApplication()
    application.value = response.data
    if (response.data && !formDraft.hasDraft) {
      form.role = response.data.requested_role
      form.ownershipType = response.data.ownership_type || 'individual'
      form.businessName = response.data.business_name || ''
      form.licenseNumber = response.data.license_number || ''
      form.agencyName = response.data.agency_name || ''
    }
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load your account request.'
  } finally {
    loading.value = false
  }
}

async function submit() {
  error.value = ''
  submitting.value = true
  try {
    const response = await submitPublisherApplication({
      requested_role: form.role,
      ...(form.role === 'owner' ? { ownership_type: form.ownershipType } : {}),
      ...(form.role === 'developer' ? { business_name: form.businessName.trim() } : {}),
      ...(form.role === 'broker' ? { license_number: form.licenseNumber.trim(), agency_name: form.agencyName.trim() } : {}),
    })
    application.value = response.data
    formDraft.clear()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to submit your account request.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="application-page">
    <RouterLink to="/" class="back">← Back to ButuanSpaces</RouterLink>
    <header><span class="eyebrow">PUBLISHER ACCESS</span><h1>List a property</h1><p>Your buyer account and saved activity stay with you. Request publisher access to create and manage listings.</p></header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="state">Loading your request…</p>
    <section v-else-if="application?.status === 'pending'" class="status-card"><span class="badge pending">Awaiting review</span><h2>Request submitted</h2><p>Your request for {{ application.requested_role }} access is being reviewed. You can continue browsing and using your buyer account while you wait.</p><p v-if="application.review_notes" class="notes">{{ application.review_notes }}</p></section>
    <section v-else-if="application?.status === 'approved'" class="status-card"><span class="badge approved">Approved</span><h2>Publisher access is ready</h2><p>Your account has been upgraded. Open your publisher workspace to manage listings.</p><RouterLink :to="`/${application.requested_role}/dashboard`" class="primary">Open workspace</RouterLink></section>
    <form v-else class="application-form" @submit.prevent="submit">
      <label for="requested-role">Account access</label>
      <select id="requested-role" v-model="form.role"><option v-for="option in roleOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select>

      <template v-if="form.role === 'owner'">
        <label for="ownership-type">Ownership type</label>
        <select id="ownership-type" v-model="form.ownershipType"><option value="individual">Individual owner</option><option value="company">Company representative</option><option value="representative">Authorized representative</option></select>
      </template>

      <template v-if="form.role === 'broker'">
        <label for="license-number">PRC license number</label><input id="license-number" v-model="form.licenseNumber" required maxlength="100" autocomplete="off"/>
        <label for="agency-name">Agency or brokerage <span>(optional)</span></label><input id="agency-name" v-model="form.agencyName" maxlength="255" autocomplete="organization"/>
      </template>

      <template v-if="form.role === 'developer'">
        <label for="business-name">Registered business or development company</label><input id="business-name" v-model="form.businessName" required maxlength="255" autocomplete="organization"/>
      </template>

      <p class="review-note">An administrator reviews publisher requests. Do not submit confidential documents here; document upload is not available yet.</p>
      <button class="primary" type="submit" :disabled="submitting">{{ submitting ? 'Submitting…' : 'Submit for review' }}</button>
    </form>
  </main>
</template>

<style scoped>
.application-page{width:min(760px,calc(100% - 36px));margin:0 auto;padding:36px 0 80px;color:#142d4e}.back{color:#2563eb;text-decoration:none;font-size:13px}.application-page header{margin:34px 0 24px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.3px}.application-page h1{margin:9px 0;font-size:34px}.application-page header p,.status-card p,.review-note{color:#64748b;font-size:14px;line-height:1.7}.application-form,.status-card{display:grid;gap:13px;padding:25px;border:1px solid #e2e8f0;border-radius:13px;background:#fff}.application-form label{font-size:13px;font-weight:700}.application-form label span{color:#64748b;font-weight:400}.application-form input,.application-form select{min-height:44px;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px;background:#fff;font:inherit}.review-note{margin:4px 0 0;font-size:12px}.primary{display:inline-flex;justify-content:center;border:0;border-radius:8px;padding:13px 17px;background:#142d4e;color:#fff;text-decoration:none;font:inherit;font-weight:700;cursor:pointer}.primary:disabled{opacity:.6}.status-card h2{margin:2px 0}.status-card p{margin:0}.badge{width:max-content;padding:7px 10px;border-radius:20px;font-size:12px;font-weight:700}.pending{background:#fef9c3;color:#854d0e}.approved{background:#dcfce7;color:#166534}.notes{padding:12px;background:#f8fafc;border-radius:7px}.error{padding:12px;border-radius:8px;background:#fef2f2;color:#991b1b}.state{color:#64748b}
</style>
