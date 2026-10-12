<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { adminVerifications, decideVerification, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { VerificationState } from '@/data/admin/adminTypes'
const query = ref('')
const filter = ref('All')
const selectedId = ref<number | null>(null)
const note = ref('')
const feedback = ref('')
onMounted(() => loadAdminWorkspace())
const selected = computed(() => adminVerifications.value.find((item) => item.id === selectedId.value))
const rows = computed(() => adminVerifications.value.filter((item) =>
  (filter.value === 'All' || item.status === filter.value) &&
  (!query.value.trim() || [item.name, item.email, item.affiliation].some((x) => x.toLowerCase().includes(query.value.trim().toLowerCase())))
))
function select(id: number) { selectedId.value = id; feedback.value = ''; note.value = '' }
async function decide(status: Exclude<VerificationState, 'Pending'>) {
  if (!selected.value) return
  if (status === 'Rejected' && !note.value.trim()) { feedback.value = 'A rejection reason is required.'; return }
  feedback.value = await decideVerification(selected.value.id, status, note.value)
    ? `Verification ${status.toLowerCase()}.` : 'Decision could not be saved.'
}
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Broker Verification</h1><p>Review incoming broker registration requests.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <section class="admin-panel"><div class="admin-panel-head"><h2>Verification Requests</h2><span class="admin-count">{{ rows.length }} requests</span></div><div class="admin-filters"><input v-model="query" aria-label="Search verification requests" placeholder="Search applicants..."/><select v-model="filter" aria-label="Filter verifications"><option>All</option><option>Pending</option><option>Verified</option><option>Rejected</option></select></div>
    <div class="admin-table-wrap"><table><thead><tr><th>Applicant</th><th>License</th><th>Affiliation</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody><tr v-for="item in rows" :key="item.id"><td><strong>{{ item.name }}</strong><small>{{ item.email }}</small></td><td>{{ item.licenseNumber }}</td><td>{{ item.affiliation || 'Not specified' }}</td><td>{{ item.submittedAt }}</td><td><span class="admin-status" :class="item.status.toLowerCase()">{{ item.status }}</span></td><td><button type="button" class="admin-button-secondary" :aria-label="`Review verification ${item.id}`" @click="select(item.id)">View Request</button></td></tr></tbody></table></div>
    <div v-if="!rows.length" class="admin-empty">No broker verification requests are available.</div></section>
  <section v-if="selected" class="admin-panel" aria-label="Selected verification"><div class="admin-panel-head"><h2>Verification Details</h2><button type="button" class="admin-button-secondary" @click="selectedId=null">Close</button></div><div class="admin-detail"><h3>{{ selected.name }}</h3><p>{{ selected.email }}</p><p><strong>License number:</strong> {{ selected.licenseNumber }}</p><p><strong>Brokerage:</strong> {{ selected.affiliation || 'Not specified' }}</p><p><strong>Status:</strong> {{ selected.status }}</p><p v-if="selected.note"><strong>Decision note:</strong> {{ selected.note }}</p></div>
    <template v-if="selected.status==='Pending'"><div class="admin-fields"><div class="admin-field full"><label for="admin-verification-note">Verification Note (required for rejection)</label><textarea id="admin-verification-note" v-model="note" placeholder="Review notes"></textarea></div></div><div class="admin-button-row"><button type="button" class="admin-button-success" @click="decide('Verified')">Mark Verified</button><button type="button" class="admin-button-danger" @click="decide('Rejected')">Reject Request</button></div></template><p v-else>Decision already recorded.</p><p v-if="feedback" role="status" class="admin-feedback" :class="{error: feedback.includes('required') || feedback.includes('could not')}">{{ feedback }}</p>
  </section>
</AdminShell></template>
