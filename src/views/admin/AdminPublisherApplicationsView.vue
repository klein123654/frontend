<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { fetchAdminPublisherApplications, reviewPublisherApplication, type AdminPublisherApplication } from '@/services/adminService'

const applications = ref<AdminPublisherApplication[]>([])
const selectedId = ref<number | null>(null)
const filter = ref('pending')
const note = ref('')
const error = ref('')
const feedback = ref('')
const busy = ref(false)
const selected = computed(() => applications.value.find((item) => item.id === selectedId.value) || null)
const rows = computed(() => applications.value.filter((item) => filter.value === 'all' || item.status === filter.value))

async function load() {
  error.value = ''
  try {
    applications.value = await fetchAdminPublisherApplications()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load publisher applications.'
  }
}

async function decide(status: 'approved' | 'rejected') {
  if (!selected.value) return
  if (status === 'rejected' && !note.value.trim()) {
    feedback.value = 'Add a review note before rejecting this request.'
    return
  }
  busy.value = true
  feedback.value = ''
  try {
    const response = await reviewPublisherApplication(selected.value.id, status, note.value.trim())
    const index = applications.value.findIndex((item) => item.id === response.data.id)
    if (index >= 0) applications.value[index] = response.data
    feedback.value = status === 'approved' ? 'Publisher access approved.' : 'Application rejected.'
  } catch (cause) {
    feedback.value = cause instanceof Error ? cause.message : 'Unable to save this review.'
  } finally {
    busy.value = false
  }
}

function select(item: AdminPublisherApplication) {
  selectedId.value = item.id
  note.value = item.review_notes || ''
  feedback.value = ''
}

onMounted(load)
</script>

<template>
  <AdminShell>
    <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Publisher Applications</h1><p>Review buyer requests for owner, broker, or developer access.</p></div></header>
    <p v-if="error" class="admin-notice" role="alert">{{ error }}</p>
    <section class="admin-panel">
      <div class="admin-panel-head"><h2>Account requests</h2><select v-model="filter" aria-label="Filter publisher applications"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option></select></div>
      <div class="admin-table-wrap"><table><thead><tr><th>Applicant</th><th>Requested access</th><th>Details</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>
        <tr v-for="item in rows" :key="item.id"><td><strong>{{ item.applicant.name }}</strong><small>{{ item.applicant.email }}</small></td><td>{{ item.requested_role }}</td><td>{{ item.license_number || item.business_name || item.ownership_type || item.agency_name || '—' }}</td><td>{{ item.created_at.slice(0, 10) }}</td><td>{{ item.status }}</td><td><button class="admin-button-secondary" type="button" @click="select(item)">Review</button></td></tr>
      </tbody></table></div>
      <div v-if="!rows.length" class="admin-empty">No account requests in this view.</div>
    </section>
    <section v-if="selected" class="admin-panel review-panel" aria-label="Selected publisher application">
      <div class="admin-panel-head"><h2>Review {{ selected.requested_role }} request</h2><button class="admin-button-secondary" type="button" @click="selectedId = null">Close</button></div>
      <div class="details"><p><strong>Applicant:</strong> {{ selected.applicant.name }} ({{ selected.applicant.email }})</p><p><strong>Requested access:</strong> {{ selected.requested_role }}</p><p v-if="selected.ownership_type"><strong>Ownership type:</strong> {{ selected.ownership_type }}</p><p v-if="selected.business_name"><strong>Business:</strong> {{ selected.business_name }}</p><p v-if="selected.license_number"><strong>PRC license:</strong> {{ selected.license_number }}</p><p v-if="selected.agency_name"><strong>Agency:</strong> {{ selected.agency_name }}</p><p v-if="selected.review_notes"><strong>Review note:</strong> {{ selected.review_notes }}</p></div>
      <template v-if="selected.status === 'pending'"><label for="review-note">Review note <span>(required to reject)</span></label><textarea id="review-note" v-model="note" rows="3"></textarea><div class="actions"><button class="approve" type="button" :disabled="busy" @click="decide('approved')">Approve and enable workspace</button><button class="reject" type="button" :disabled="busy" @click="decide('rejected')">Reject request</button></div></template>
      <p v-else>This request has already been reviewed.</p>
      <p v-if="feedback" role="status" class="feedback">{{ feedback }}</p>
    </section>
  </AdminShell>
</template>

<style scoped>
.admin-panel{margin-top:20px;padding:22px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}.admin-panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}.admin-panel-head h2{margin:0;color:#142d4e;font-size:18px}.admin-panel-head select{min-height:38px;border:1px solid #cbd5e1;border-radius:7px;padding:7px}.admin-table-wrap{overflow-x:auto}table{width:100%;border-collapse:collapse;text-align:left}th,td{padding:13px 10px;border-bottom:1px solid #edf0f5;font-size:12px;color:#334155}th{color:#64748b;font-weight:700}td strong,td small{display:block}td small{margin-top:4px;color:#94a3b8}.admin-button-secondary{padding:8px 11px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;color:#2563eb;font-weight:700;cursor:pointer}.admin-empty{padding:35px;text-align:center;color:#64748b}.review-panel .details{margin-bottom:18px}.details p{margin:8px 0;color:#475569;font-size:13px}.review-panel label{display:block;margin-bottom:8px;color:#142d4e;font-size:13px;font-weight:700}.review-panel label span{color:#64748b;font-weight:400}.review-panel textarea{width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font:inherit}.actions{display:flex;gap:10px;margin-top:14px}.actions button{padding:11px 14px;border:0;border-radius:8px;color:white;font-weight:700;cursor:pointer}.actions button:disabled{opacity:.6}.approve{background:#15803d}.reject{background:#b91c1c}.feedback{color:#2563eb;font-size:13px}.admin-notice{padding:12px;background:#fef2f2;color:#991b1b;border-radius:8px}
</style>
