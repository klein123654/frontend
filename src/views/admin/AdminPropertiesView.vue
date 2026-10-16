<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import AdminShell from '@/components/admin/AdminShell.vue'
import { adminListings, pendingAdminListings, reviewAdminListing, unpublishAdminListing, loadAdminWorkspace, adminError } from '@/stores/adminWorkspace'
import type { AdminDecision } from '@/data/admin/adminTypes'

const query = ref('')
const statusFilter = ref('All')
const selectedKey = ref<string | null>(null)
const detailsPanel = ref<HTMLElement | null>(null)
const detailsTrigger = ref<HTMLElement | null>(null)
const note = ref('')
const feedback = ref('')
const selected = computed(() => adminListings.value.find((item) => item.key === selectedKey.value))
onMounted(() => loadAdminWorkspace())
const filtered = computed(() => adminListings.value.filter((item) => {
  const matches = !query.value.trim() || [item.title, item.location, item.barangay, item.source]
    .some((part) => part.toLowerCase().includes(query.value.trim().toLowerCase()))
  return matches && (statusFilter.value === 'All' || item.status === statusFilter.value)
}))
async function select(key: string, event: MouseEvent) {
  detailsTrigger.value = event.currentTarget as HTMLElement
  selectedKey.value = key
  note.value = ''
  feedback.value = ''
  await nextTick()
  detailsPanel.value?.focus()
}
async function closeDetails() {
  selectedKey.value = null
  await nextTick()
  detailsTrigger.value?.focus()
}
async function decide(decision: AdminDecision) {
  if (!selected.value) return
  if (decision === 'Rejected' && !note.value.trim()) { feedback.value = 'A rejection reason is required.'; return }
  feedback.value = await reviewAdminListing(selected.value.key, decision, note.value)
    ? `Listing ${decision.toLowerCase()}.` : 'Review could not be saved.'
}
async function unpublish() {
  if (!selected.value) return
  if (!note.value.trim()) { feedback.value = 'A reason is required to unpublish.'; return }
  if (!window.confirm(`Unpublish "${selected.value.title}" and return it to draft?`)) return
  feedback.value = await unpublishAdminListing(selected.value.key, note.value)
    ? 'Listing unpublished and returned to draft.' : 'Unpublish could not be saved.'
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
    <tbody><tr v-for="item in filtered" :key="item.key"><td><strong>{{ item.title }}</strong><small>{{ item.location || 'Location not specified' }}</small></td><td>{{ item.source }}</td><td>{{ currency(item.price) }}</td><td><span class="admin-status" :class="item.status.toLowerCase()">{{ item.status }}</span></td><td><button type="button" class="admin-button-secondary" :aria-label="`Review ${item.title}`" @click="select(item.key, $event)">View Details</button></td></tr></tbody></table></div>
    <div v-if="filtered.length===0" class="admin-empty">No listings match your filters.</div>
  </section>
  <Teleport to="body">
    <div v-if="selected" class="details-backdrop" @click.self="closeDetails" @keydown.esc="closeDetails">
      <section ref="detailsPanel" class="details-dialog" role="dialog" aria-modal="true" aria-labelledby="listing-details-title" tabindex="-1">
        <div class="details-header"><div><span class="details-eyebrow">{{ selected.source }} LISTING</span><h2 id="listing-details-title">Listing Details</h2></div><button type="button" class="details-close" aria-label="Close listing details" @click="closeDetails">&times;</button></div>
        <div class="details-summary"><h3>{{ selected.title }}</h3><div class="details-meta"><div><span>Property ID</span><strong>{{ selected.id }}</strong></div><div><span>Submitted</span><strong>{{ selected.dateCreated }}</strong></div><div><span>Location</span><strong>{{ selected.location || 'Not specified' }}<template v-if="selected.barangay">, {{ selected.barangay }}</template></strong></div><div><span>Status</span><span class="admin-status" :class="selected.status.toLowerCase()">{{ selected.status }}</span></div></div><p v-if="selected.reviewNote" class="details-review-note"><strong>Previous decision note</strong>{{ selected.reviewNote }}</p></div>
        <section class="details-photos" aria-label="Listing photos"><div class="details-section-head"><h3>Listing Photos</h3><span>{{ selected.images.length }}</span></div><div v-if="selected.images.length" class="details-photo-grid"><a v-for="(image, index) in selected.images" :key="image.url" :href="image.url" target="_blank" rel="noopener noreferrer" :aria-label="`Open photo ${index + 1} for ${selected.title}`"><img :src="image.url" :alt="image.alt" /></a></div><p v-else class="details-no-photos">No photos have been uploaded for this listing.</p></section>
        <template v-if="selected.status==='Pending'"><div class="details-fields"><div class="details-field"><label for="admin-review-note">Review Note <span>Required for rejection</span></label><textarea id="admin-review-note" v-model="note" placeholder="Add context for the decision. A reason is required to reject this listing."></textarea></div></div>
          <div class="details-actions"><button type="button" class="admin-button-success" @click="decide('Approved')">Approve Listing</button><button type="button" class="admin-button-danger" @click="decide('Rejected')">Reject Listing</button></div></template>
        <template v-else-if="selected.status==='Approved'"><div class="details-fields"><div class="details-field"><label for="admin-unpublish-note">Reason for unpublishing</label><textarea id="admin-unpublish-note" v-model="note" placeholder="Explain why this listing should be removed from public results."></textarea></div></div>
          <div class="details-actions"><button type="button" class="admin-button-danger" @click="unpublish">Unpublish Listing</button></div></template>
        <p v-else class="details-readonly">This listing is not awaiting review.</p>
        <p v-if="feedback" role="status" class="admin-feedback" :class="{error: feedback.includes('required') || feedback.includes('could not')}">{{ feedback }}</p>
      </section>
    </div>
  </Teleport>
</AdminShell></template>

<style scoped>
.details-backdrop {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgb(15 23 42 / 52%);
}

.details-dialog {
  width: min(100%, 760px);
  max-height: min(88vh, 820px);
  overflow-y: auto;
  padding: 32px;
  border: 1px solid #dbe2ea;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 24px 70px rgb(15 23 42 / 28%);
  outline: none;
}

.details-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.details-header h2 {
  margin: 4px 0 0;
  color: #142d4e;
  font-size: 24px;
}

.details-eyebrow {
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.details-close {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #fff;
  color: #334155;
  font-size: 23px;
  line-height: 1;
  cursor: pointer;
}

.details-readonly {
  margin: 20px 0 0;
  color: #64748b;
  font-size: 13px;
}

.details-summary {
  margin-bottom: 26px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
}

.details-summary h3 {
  margin: 0 0 20px;
  color: #142d4e;
  font-size: 20px;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.details-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 28px;
}

.details-meta > div {
  display: flex;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
}

.details-meta > div > span:first-child {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
}

.details-meta strong {
  color: #1e293b;
  font-size: 13px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.details-dialog .admin-status {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.details-dialog .admin-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.details-dialog .admin-status.approved {
  background: #dcfce7;
  color: #166534;
}

.details-dialog .admin-status.rejected {
  background: #fee2e2;
  color: #991b1b;
}

.details-review-note {
  display: grid;
  gap: 6px;
  margin-top: 20px !important;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  white-space: pre-wrap;
}

.details-review-note strong {
  color: #334155;
  font-size: 12px;
}

.details-photos {
  margin: 0 0 26px;
}

.details-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.details-section-head h3 {
  margin: 0;
  color: #142d4e;
  font-size: 15px;
}

.details-section-head span {
  color: #64748b;
  font-size: 12px;
}

.details-photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.details-photo-grid a {
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 1px solid #dbe2ea;
  border-radius: 7px;
  background: #f1f5f9;
}

.details-photo-grid img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 160ms ease;
}

.details-photo-grid a:hover img {
  transform: scale(1.035);
}

.details-no-photos {
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 7px;
  color: #64748b;
  background: #f8fafc;
  font-size: 12px;
  text-align: center;
}

.details-fields {
  display: grid;
  gap: 10px;
  margin: 0 0 22px;
}

.details-field {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.details-field label {
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.details-field label span {
  margin-left: 5px;
  color: #64748b;
  font-size: 11px;
  font-weight: 400;
}

.details-field textarea {
  width: 100%;
  min-height: 132px;
  padding: 13px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 7px;
  color: #142d4e;
  background: #fff;
  font: inherit;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
}

.details-field textarea:focus {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.details-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.details-actions button {
  min-height: 44px;
  padding: 11px 18px;
  border: 1px solid #142d4e;
  border-radius: 7px;
  color: #fff;
  background: #142d4e;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.details-actions .admin-button-success {
  border-color: #15803d;
  background: #15803d;
}

.details-actions .admin-button-danger {
  border-color: #b91c1c;
  background: #b91c1c;
}

.details-dialog :deep(.admin-feedback) {
  margin-top: 16px;
  font-size: 13px;
  color: #15803d;
}

.details-dialog :deep(.admin-feedback.error) {
  color: #b91c1c;
}

@media (max-width: 600px) {
  .details-backdrop {
    align-items: end;
    padding: 0;
  }

  .details-dialog {
    width: 100%;
    max-height: 90vh;
    padding: 22px 20px max(22px, env(safe-area-inset-bottom));
    border-radius: 12px 12px 0 0;
  }

  .details-meta {
    gap: 16px;
  }

  .details-summary {
    padding: 18px;
  }

  .details-actions {
    justify-content: stretch;
  }

  .details-actions button {
    flex: 1 1 160px;
  }
}
</style>
