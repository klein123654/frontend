<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { adminListings, pendingAdminListings, reviewAdminListing, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { AdminDecision } from '@/data/admin/adminTypes'

const query = ref('')
const statusFilter = ref('All')
const selectedKey = ref<string | null>(null)
const note = ref('')
const feedback = ref('')
const selected = computed(() => adminListings.value.find((item) => item.key === selectedKey.value))
onMounted(() => loadAdminWorkspace())
const filtered = computed(() => adminListings.value.filter((item) => {
  const matches = !query.value.trim() || [item.title, item.location, item.barangay, item.source]
    .some((part) => part.toLowerCase().includes(query.value.trim().toLowerCase()))
  return matches && (statusFilter.value === 'All' || item.status === statusFilter.value)
}))
function select(key: string) { selectedKey.value = key; note.value = ''; feedback.value = '' }
async function decide(decision: AdminDecision) {
  if (!selected.value) return
  if (decision === 'Rejected' && !note.value.trim()) { feedback.value = 'A rejection reason is required.'; return }
  feedback.value = await reviewAdminListing(selected.value.key, decision, note.value)
    ? `Listing ${decision.toLowerCase()}.` : 'Review could not be saved.'
}
function currency(price: number) { return price > 0 ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(price) : 'Not specified' }
</script>
<template><AdminShell>
  <header class="admin-heading"><div><span class="admin-eyebrow">ADMIN WORKSPACE</span><h1>Property Approvals</h1><p>Review properties submitted by owners and brokers.</p></div></header>
  <div v-if="adminError" class="admin-notice" role="alert">{{ adminError }}</div>
  <div class="admin-stats"><div class="admin-stat"><span>All Listings</span><strong>{{ adminListings.length }}</strong></div><div class="admin-stat"><span>Awaiting Review</span><strong>{{ pendingAdminListings.length }}</strong></div></div>
  <section class="admin-panel"><div class="admin-panel-head"><h2>Listing Review Queue</h2><span class="admin-count">{{ filtered.length }} records</span></div>
    <div class="admin-filters"><input v-model="query" aria-label="Search property approvals" placeholder="Search properties..."/><select v-model="statusFilter" aria-label="Filter property status"><option>All</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Draft</option></select></div>
    <div class="admin-table-wrap"><table><thead><tr><th>Listing</th><th>Submitted By</th><th>Price</th><th>Status</th><th>Action</th></tr></thead>
    <tbody><tr v-for="item in filtered" :key="item.key"><td><strong>{{ item.title }}</strong><small>{{ item.location || 'Location not specified' }}</small></td><td>{{ item.source }}</td><td>{{ currency(item.price) }}</td><td><span class="admin-status" :class="item.status.toLowerCase()">{{ item.status }}</span></td><td><button type="button" class="admin-button-secondary" :aria-label="`Review ${item.title}`" @click="select(item.key)">View Details</button></td></tr></tbody></table></div>
    <div v-if="filtered.length===0" class="admin-empty">No listings match your filters.</div>
  </section>
  <section v-if="selected" class="admin-panel" aria-label="Selected property review"><div class="admin-panel-head"><h2>Listing Details</h2><button type="button" class="admin-button-secondary" @click="selectedKey=null">Close</button></div>
    <div class="admin-detail"><h3>{{ selected.title }}</h3><p><strong>Source:</strong> {{ selected.source }} · <strong>Property ID:</strong> {{ selected.id }}</p><p><strong>Location:</strong> {{ selected.location || 'Not specified' }} · {{ selected.barangay || 'Barangay not specified' }}</p><p><strong>Submitted:</strong> {{ selected.dateCreated }}</p><p><strong>Status:</strong> {{ selected.status }}</p><p v-if="selected.reviewNote"><strong>Decision note:</strong> {{ selected.reviewNote }}</p></div>
    <template v-if="selected.status==='Pending'"><div class="admin-fields"><div class="admin-field full"><label for="admin-review-note">Review Note (required for rejection)</label><textarea id="admin-review-note" v-model="note" placeholder="Reason or decision note"></textarea></div></div>
      <div class="admin-button-row"><button type="button" class="admin-button-success" @click="decide('Approved')">Approve Listing</button><button type="button" class="admin-button-danger" @click="decide('Rejected')">Reject Listing</button></div></template>
    <p v-else>This listing is not awaiting review.</p>
    <p v-if="feedback" role="status" class="admin-feedback" :class="{error: feedback.includes('required') || feedback.includes('could not')}">{{ feedback }}</p>
  </section>
</AdminShell></template>
