<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { submitIssueReport } from '@/services/verificationService'
import { useFormDraft } from '@/composables/useFormDraft'
const categories = ['General Bug', 'Display / Layout', 'Login / Registration', 'Property Listings', 'Messages / Inquiries', 'Other']
const form = reactive({ name: '', email: '', category: 'General Bug', title: '', description: '' })
const formDraft = useFormDraft('report-issue', form)
const feedback = ref('')
const success = ref(false)
const submitting = ref(false)
async function submit() {
  success.value = false
  if (!form.title.trim() || !form.description.trim()) { feedback.value = 'Issue title and description are required.'; return }
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { feedback.value = 'Enter a valid email or leave it blank.'; return }
  submitting.value = true
  try {
    await submitIssueReport({ name: form.name.trim(), email: form.email.trim(), category: form.category, title: form.title.trim(), description: form.description.trim() })
    feedback.value = 'Your issue report has been submitted.'
    success.value = true
    formDraft.clear()
    form.title = ''
    form.description = ''
  } catch (error) {
    feedback.value = error instanceof Error ? error.message : 'Unable to submit your report.'
  } finally {
    submitting.value = false
  }
}
</script>
<template><main class="issue-page"><div class="issue-card"><span class="issue-eyebrow">BUTUANSPACES SUPPORT</span><h1>Report an Issue</h1><p>Found a problem with the website? Submit a report for administrator review.</p>
  <form @submit.prevent="submit" novalidate><div class="grid"><div class="field"><label for="issue-name">Name (optional)</label><input id="issue-name" v-model="form.name" maxlength="100" placeholder="Your name"/></div><div class="field"><label for="issue-email">Email (optional)</label><input id="issue-email" v-model="form.email" type="email" maxlength="150" placeholder="name@example.com"/></div><div class="field full"><label for="issue-category">Category</label><select id="issue-category" v-model="form.category"><option v-for="category in categories" :key="category">{{ category }}</option></select></div><div class="field full"><label for="issue-title">Issue Title *</label><input id="issue-title" v-model="form.title" maxlength="140" placeholder="Briefly describe the issue"/></div><div class="field full"><label for="issue-description">What happened? *</label><textarea id="issue-description" v-model="form.description" rows="6" placeholder="Describe how to reproduce the problem"></textarea></div></div>
    <p v-if="feedback" role="status" :class="success ? 'feedback success' : 'feedback error'">{{ feedback }}</p><div class="actions"><RouterLink to="/" class="back">Back to Home</RouterLink><button type="submit" :disabled="submitting">{{ submitting ? 'Submitting…' : 'Submit Report' }}</button></div></form>
  </div></main></template>
<style scoped>
.issue-page {max-width:920px;margin:40px auto 90px;padding:0 22px;color:#334155;}.issue-card {background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:clamp(22px,4vw,45px);box-shadow:0 12px 35px rgba(20,45,78,.05)}.issue-eyebrow {font-size:11px;font-weight:800;letter-spacing:1.5px;color:#2563eb;}h1{font-size:32px;color:#142d4e;margin:12px 0}p{font-size:13px;color:#64748b;line-height:1.75}.notice{background:#eff6ff;border:1px solid #dbeafe;padding:15px 18px;color:#47617f;font-size:12px;line-height:1.65;border-radius:9px;margin:24px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.field{display:flex;flex-direction:column;gap:8px}.field.full{grid-column:1/-1}label{font-size:12px;font-weight:700}input,textarea,select{border:1px solid #cbd5e1;border-radius:8px;padding:12px;font:inherit;font-size:13px;background:white;color:#142d4e;}input:focus,textarea:focus,select:focus{outline:2px solid #93c5fd;outline-offset:1px}.actions{display:flex;justify-content:flex-end;align-items:center;gap:20px;margin-top:20px}.actions button{background:#142d4e;color:#fff;border:0;border-radius:8px;padding:13px 20px;font-weight:700;cursor:pointer}.back{font-size:12px;color:#64748b;text-decoration:none}.feedback{font-size:12px;margin-top:14px}.success{color:#15803d}.error{color:#b91c1c}@media(max-width:640px){.grid{grid-template-columns:1fr}.field.full{grid-column:auto}}
</style>
