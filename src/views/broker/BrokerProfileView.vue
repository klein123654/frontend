<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ShieldCheck, UserRound } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuth } from '@/composables/useAuth'
import { fetchBrokerVerification, submitBrokerVerification } from '@/services/verificationService'
import { useFormDraft } from '@/composables/useFormDraft'

const { user } = useAuth()
const verificationForm = reactive({ licenseNumber: '', agencyName: '' })
const formDraft = useFormDraft('broker-verification', verificationForm)
const status = ref('Not submitted')
const reviewNotes = ref('')
const feedback = ref('')
const loading = ref(false)
onMounted(async () => {
  try {
    const result = await fetchBrokerVerification()
    if (result.data) {
      if (!formDraft.hasDraft) {
        verificationForm.licenseNumber = result.data.license_number ?? ''
        verificationForm.agencyName = result.data.agency_name ?? ''
      }
      status.value = result.data.status
      reviewNotes.value = result.data.review_notes ?? ''
    }
  } catch (error) { feedback.value = error instanceof Error ? error.message : 'Unable to load verification.' }
})
async function submit() {
  feedback.value = ''
  loading.value = true
  try {
    await submitBrokerVerification({ license_number: verificationForm.licenseNumber.trim(), agency_name: verificationForm.agencyName.trim() })
    formDraft.clear()
    status.value = 'pending'
    feedback.value = 'Verification details submitted for review.'
  } catch (error) { feedback.value = error instanceof Error ? error.message : 'Unable to submit verification.' }
  finally { loading.value = false }
}
</script>
<template><AppSidebar role="broker"><main class="page"><span class="eyebrow">BROKER WORKSPACE</span><h1>Broker Profile</h1><p>Manage your account and professional verification.</p><div class="grid"><section class="panel"><UserRound :size="25"/><h2>Professional Information</h2><p><strong>Name:</strong> {{ user?.name }}</p><p><strong>Email:</strong> {{ user?.email }}</p><p><strong>Phone:</strong> {{ user?.phone || 'Not provided' }}</p><span class="status">{{ user?.account_status }}</span></section><section class="panel"><ShieldCheck :size="25"/><h2>Broker Verification</h2><p>Listing submission requires administrator approval of your license details.</p><span class="status">{{ status }}</span><p v-if="reviewNotes">{{ reviewNotes }}</p><form @submit.prevent="submit"><label for="license-number">PRC License Number</label><input id="license-number" v-model="verificationForm.licenseNumber" required maxlength="100"/><label for="agency-name">Agency / Brokerage</label><input id="agency-name" v-model="verificationForm.agencyName" maxlength="255"/><button :disabled="loading">{{ loading ? 'Submitting…' : 'Submit for Review' }}</button></form><p v-if="feedback" role="status">{{ feedback }}</p></section></div></main></AppSidebar></template>
<style scoped>.page{max-width:1350px;margin:auto}.eyebrow{color:#2563eb;font-size:11px;letter-spacing:1.3px;font-weight:800}h1{color:#142d4e;font-size:32px;margin:10px 0}h2{font-size:18px;color:#142d4e}p{color:#64748b;font-size:13px;line-height:1.8}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}.panel{background:white;border:1px solid #e2e8f0;border-radius:13px;padding:28px}.panel>svg{color:#2563eb}.status{display:inline-block;font-size:11px;color:#64748b;background:#f1f5f9;padding:8px 11px;border-radius:7px;text-transform:capitalize}form{display:grid;gap:9px;margin-top:20px}label{font-size:12px;font-weight:700}input{min-height:42px;border:1px solid #cbd5e1;border-radius:8px;padding:10px;font:inherit}button{margin-top:8px;background:#142d4e;color:white;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer}button:disabled{opacity:.6}@media(max-width:700px){.grid{grid-template-columns:1fr}}</style>
