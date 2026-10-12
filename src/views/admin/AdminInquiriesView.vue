<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { adminInquiries, setAdminInquiryStatus, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { CaseState } from '@/data/admin/adminTypes'
const query = ref('')
const statusFilter = ref('All')
const opened = ref<number | null>(null)
const feedback = ref('')
onMounted(() => loadAdminWorkspace())
const rows = computed(() => adminInquiries.value.filter((item) =>
  (statusFilter.value === 'All' || item.status === statusFilter.value) &&
  (!query.value.trim() || [item.name, item.email, item.subject, item.message].some((x) => x.toLowerCase().includes(query.value.trim().toLowerCase())))
))
const selected = computed(() => adminInquiries.value.find((item) => item.id === opened.value))
async function change(id: number, event: Event) {
  const status = (event.target as HTMLSelectElement).value as CaseState
  feedback.value = await setAdminInquiryStatus(id, status) ? 'Inquiry status saved.' : (adminError.value || 'Could not save inquiry status.')
}
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Inquiries Management</h1><p>Review administrative messages and track their status.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <section class="admin-panel"><div class="admin-panel-head"><h2>Administrative Inbox</h2><span class="admin-count">{{ rows.length }} inquiries</span></div><div class="admin-filters"><input v-model="query" aria-label="Search admin inquiries" placeholder="Search inquiries..."/><select v-model="statusFilter" aria-label="Filter inquiry status"><option>All</option><option>New</option><option>In Progress</option><option>Resolved</option></select></div>
    <div class="admin-table-wrap"><table><thead><tr><th>Sender</th><th>Subject</th><th>Received</th><th>Status</th><th>Action</th></tr></thead><tbody><tr v-for="item in rows" :key="item.id"><td><strong>{{ item.name }}</strong><small>{{ item.email }}</small></td><td>{{ item.subject }}</td><td>{{ item.createdAt }}</td><td><span class="admin-status" :class="item.status.toLowerCase().replace(' ','-')">{{ item.status }}</span></td><td><button type="button" class="admin-button-secondary" :aria-label="`View inquiry ${item.id}`" @click="opened=item.id;feedback=''">View</button></td></tr></tbody></table></div>
    <div v-if="!rows.length" class="admin-empty">No administrative inquiries available yet.</div></section>
  <section v-if="selected" class="admin-panel" aria-label="Selected admin inquiry"><div class="admin-panel-head"><h2>Inquiry Details</h2><button type="button" class="admin-button-secondary" @click="opened=null">Close</button></div><div class="admin-detail"><h3>{{ selected.subject }}</h3><p><strong>From:</strong> {{ selected.name }} ({{ selected.email }})</p><p>{{ selected.message }}</p></div><div class="admin-field"><label for="admin-inquiry-status">Inquiry Status</label><select id="admin-inquiry-status" :value="selected.status" @change="change(selected.id, $event)"><option>New</option><option>In Progress</option><option>Resolved</option></select></div><p v-if="feedback" role="status" class="admin-feedback">{{ feedback }}</p></section>
</AdminShell></template>
