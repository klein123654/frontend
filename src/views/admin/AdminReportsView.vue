<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { adminReports, setAdminReportStatus, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { CaseState } from '@/data/admin/adminTypes'
const query = ref('')
const statusFilter = ref('All')
const selectedId = ref<number | null>(null)
const feedback = ref('')
onMounted(() => loadAdminWorkspace())
const rows = computed(() => adminReports.value.filter((item) =>
  (statusFilter.value === 'All' || item.status === statusFilter.value) &&
  (!query.value.trim() || [item.title, item.category, item.description, item.name].some((x) => x.toLowerCase().includes(query.value.trim().toLowerCase())))
))
const selected = computed(() => adminReports.value.find((item) => item.id === selectedId.value))
async function change(id: number, event: Event) {
  const status = (event.target as HTMLSelectElement).value as CaseState
  feedback.value = await setAdminReportStatus(id, status) ? 'Report status saved.' : (adminError.value || 'Could not save report status.')
}
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Issue Reports</h1><p>Review user reports, investigate the reported problems, and track resolution status.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <section class="admin-panel"><div class="admin-panel-head"><h2>Issue Reports</h2><span class="admin-count">{{ rows.length }} reports</span></div><div class="admin-filters"><input v-model="query" aria-label="Search bug reports" placeholder="Search issues..."/><select v-model="statusFilter" aria-label="Filter report status"><option>All</option><option>New</option><option>In Progress</option><option>Resolved</option></select></div>
    <div class="admin-table-wrap"><table><thead><tr><th>Issue</th><th>Reporter</th><th>Submitted</th><th>Status</th><th>Action</th></tr></thead><tbody><tr v-for="item in rows" :key="item.id"><td><strong>{{ item.title }}</strong><small>{{ item.category }}</small></td><td>{{ item.name || 'Anonymous' }}</td><td>{{ item.createdAt.slice(0,10) }}</td><td><span class="admin-status" :class="item.status.toLowerCase().replace(' ','-')">{{ item.status }}</span></td><td><button type="button" class="admin-button-secondary" :aria-label="`View report ${item.id}`" @click="selectedId=item.id;feedback=''">View Report</button></td></tr></tbody></table></div><div v-if="!rows.length" class="admin-empty">No user issue reports have been submitted.</div></section>
  <section v-if="selected" class="admin-panel" aria-label="Selected bug report"><div class="admin-panel-head"><h2>Report Details</h2><button type="button" class="admin-button-secondary" @click="selectedId=null">Close</button></div><div class="admin-detail"><h3>{{ selected.title }}</h3><p><strong>Category:</strong> {{ selected.category }}</p><p><strong>Reporter:</strong> {{ selected.name || 'Anonymous' }} {{ selected.email }}</p><p>{{ selected.description }}</p></div><div class="admin-field"><label for="admin-report-status">Report Status</label><select id="admin-report-status" :value="selected.status" @change="change(selected.id, $event)"><option>New</option><option>In Progress</option><option>Resolved</option></select></div><p v-if="feedback" role="status" class="admin-feedback">{{ feedback }}</p></section>
</AdminShell></template>
