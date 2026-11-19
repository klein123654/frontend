<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ShieldCheck, UserRound } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import BrokerCredentialsFields from '@/components/forms/BrokerCredentialsFields.vue'
import PublicContactSettings from '@/components/publisher/PublicContactSettings.vue'
import { useAuth } from '@/composables/useAuth'
import { useFormDraft } from '@/composables/useFormDraft'
import { fetchBrokerVerification, submitBrokerVerification } from '@/services/verificationService'
import {
  CREDENTIAL_STATUS_TEXT,
  credentialFormFrom,
  credentialPayload,
  DEFAULT_AFFILIATIONS,
  DEFAULT_DHSUD_NOTICE,
  emptyCredentialForm,
  type BrokerVerificationRecord,
} from '@/services/brokerCredentials'
import type { StatusTone } from '@/utils/availability'
import { formatDate } from '@/utils/format'

const { user } = useAuth()
const form = reactive({ credentials: emptyCredentialForm() })
const formDraft = useFormDraft('broker-verification', form)
const verification = ref<BrokerVerificationRecord | null>(null)
const dhsudNotice = ref(DEFAULT_DHSUD_NOTICE)
const suggestedAffiliations = ref<string[]>(DEFAULT_AFFILIATIONS)
const feedback = ref('')
const feedbackIsError = ref(false)
const loading = ref(false)

const statusBadge = computed<{ label: string; tone: StatusTone }>(() => {
  const record = verification.value
  if (!record) return { label: 'Not submitted', tone: 'grey' }
  if (record.status === 'pending') return { label: 'Waiting for admin review', tone: 'blue' }
  if (record.status === 'rejected') return { label: 'Not verified', tone: 'red' }
  if (record.credential_status === 'expired') return { label: 'Registration expired', tone: 'red' }
  if (record.credential_status === 'missing') return { label: 'Validity dates needed', tone: 'amber' }
  if (record.credential_status === 'expiring') return { label: 'Verified · expiring soon', tone: 'amber' }
  return { label: 'Verified', tone: 'green' }
})

const credentialText = computed(() =>
  verification.value?.status === 'verified' ? CREDENTIAL_STATUS_TEXT[verification.value.credential_status] : '',
)

onMounted(async () => {
  try {
    const result = await fetchBrokerVerification()
    verification.value = result.data
    if (result.meta) {
      dhsudNotice.value = result.meta.dhsud_notice
      suggestedAffiliations.value = result.meta.suggested_affiliations
    }
    if (result.data && !formDraft.hasDraft) form.credentials = credentialFormFrom(result.data)
  } catch (error) {
    feedbackIsError.value = true
    feedback.value = error instanceof Error ? error.message : 'Unable to load verification.'
  }
})

async function submit() {
  feedback.value = ''
  feedbackIsError.value = false
  loading.value = true
  try {
    const result = await submitBrokerVerification(credentialPayload(form.credentials))
    verification.value = result.data
    formDraft.clear()
    feedback.value = 'Your credentials were sent to an administrator for checking. You can add or edit listings again once they are approved.'
  } catch (error) {
    feedbackIsError.value = true
    feedback.value = error instanceof Error ? error.message : 'Unable to submit verification.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AppSidebar role="broker">
    <main class="page">
      <span class="eyebrow">BROKER WORKSPACE</span>
      <h1>Broker Profile</h1>
      <p>Manage your account, professional credentials and public contact details.</p>
      <div class="grid">
        <section class="panel">
          <UserRound :size="25" />
          <h2>Professional Information</h2>
          <p><strong>Name:</strong> {{ user?.name }}</p>
          <p><strong>Email:</strong> {{ user?.email }}</p>
          <p><strong>Phone:</strong> {{ user?.phone || 'Not provided' }}</p>
          <template v-if="verification">
            <p v-if="verification.firm_name"><strong>Firm:</strong> {{ verification.firm_name }}<template v-if="verification.firm_position"> · {{ verification.firm_position }}</template></p>
            <p v-if="verification.prc_valid_until"><strong>PRC license valid until:</strong> {{ formatDate(verification.prc_valid_until) }}</p>
            <p v-if="verification.dhsud_valid_until"><strong>DHSUD registration valid until:</strong> {{ formatDate(verification.dhsud_valid_until) }}</p>
            <p v-if="verification.dhsud_checked_at"><strong>DHSUD last checked by ButuanSpaces:</strong> {{ formatDate(verification.dhsud_checked_at) }}</p>
          </template>
        </section>

        <section class="panel">
          <ShieldCheck :size="25" />
          <h2>Broker Credentials</h2>
          <p>Buyers see these details on your listings. An administrator checks every submission, including renewals.</p>
          <StatusBadge :label="statusBadge.label" :tone="statusBadge.tone" size="md" data-testid="credential-status" />
          <p v-if="credentialText" class="credential-text">{{ credentialText }}</p>
          <p v-if="verification?.review_notes" class="review-notes">{{ verification.review_notes }}</p>
          <form @submit.prevent="submit">
            <BrokerCredentialsFields
              v-model="form.credentials"
              id-prefix="profile"
              :dhsud-notice="dhsudNotice"
              :suggested-affiliations="suggestedAffiliations"
            />
            <button :disabled="loading">{{ loading ? 'Submitting…' : verification?.status === 'verified' ? 'Submit renewal for review' : 'Submit for review' }}</button>
          </form>
          <p v-if="feedback" :class="{ error: feedbackIsError }" role="status">{{ feedback }}</p>
        </section>

        <PublicContactSettings class="contact-panel" />
      </div>
    </main>
  </AppSidebar>
</template>

<style scoped>
.page{max-width:1350px;margin:auto}.eyebrow{color:#2563eb;font-size:11px;letter-spacing:1.3px;font-weight:800}h1{color:#142d4e;font-size:32px;margin:10px 0}h2{font-size:18px;color:#142d4e}p{color:#5e6d82;font-size:13px;line-height:1.8}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px}.panel{background:white;border:1px solid #e2e8f0;border-radius:13px;padding:28px}.panel>svg{color:#2563eb}form{display:grid;gap:12px;margin-top:20px}button{margin-top:8px;background:#142d4e;color:white;border:0;border-radius:8px;padding:12px;font-weight:700;cursor:pointer}button:disabled{opacity:.6}.contact-panel{grid-column:1/-1}.credential-text{margin:10px 0 0;color:#334155}.review-notes{padding:10px 12px;border-radius:8px;background:#f8fafc}.error{color:#b91c1c}@media(max-width:900px){.grid{grid-template-columns:1fr}}
</style>
