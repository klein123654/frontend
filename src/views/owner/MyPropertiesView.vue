
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'

import {
  Building2,
  Plus,
  Search,
  Eye,
  Pencil,
  RotateCcw,
  Trash2
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'

import {
  formatOwnerPrice,
  type OwnerListingStatus
} from '@/data/owner/ownerProperties'

import {
  allOwnerProperties,
  loadOwnerProperties,
  getEditableOwnerProperty,
  deleteOwnerProperty
} from '@/stores/ownerProperties'
const workspaceBase = usePublisherBasePath()
const actionMessage = ref('')
onMounted(() => loadOwnerProperties().catch((error) => { actionMessage.value = error instanceof Error ? error.message : 'Unable to load listings.' }))

// SEARCH AND FILTERS
const search = ref('')
const statusFilter = ref<OwnerListingStatus | null>(null)

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Approved', value: 'Approved' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Draft', value: 'Draft' },
  { label: 'Rejected', value: 'Rejected' }
]

// SHARED REACTIVE PROPERTY LIST
const filteredProperties = computed(() => {
  const query = search.value.trim().toLowerCase()

  return allOwnerProperties.value.filter((property) => {
    const matchesSearch =
      !query ||
      property.title.toLowerCase().includes(query) ||
      property.location.toLowerCase().includes(query) ||
      property.propertyType.toLowerCase().includes(query) ||
      property.barangay.toLowerCase().includes(query)

    const matchesStatus =
      !statusFilter.value ||
      property.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// SUMMARY STATISTICS
const totalProperties = computed(
  () => allOwnerProperties.value.length
)

const approvedCount = computed(
  () =>
    allOwnerProperties.value.filter(
      (property) => property.status === 'Approved'
    ).length
)

const pendingCount = computed(
  () =>
    allOwnerProperties.value.filter(
      (property) => property.status === 'Pending'
    ).length
)

// STATUS BADGE COLORS
function getSeverity(status: OwnerListingStatus) {
  switch (status) {
    case 'Approved':
      return 'success'
    case 'Pending':
      return 'warn'
    case 'Rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

// EDIT PERMISSIONS
// Only browser-saved Draft listings can be edited.
function canEditProperty(id: number): boolean {
  return getEditableOwnerProperty(id) !== undefined
}

async function removeProperty(id: number, title: string) {
  if (!getEditableOwnerProperty(id)) return
  if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
  try {
    await deleteOwnerProperty(id)
    actionMessage.value = 'Listing deleted.'
  } catch (error) {
    actionMessage.value = error instanceof Error ? error.message : 'Unable to delete this listing.'
  }
}

// RESET FILTERS
function clearFilters() {
  search.value = ''
  statusFilter.value = null
}
</script>

<template>
  <AppSidebar role="owner">
    <main class="properties-page">
      <p v-if="actionMessage" class="action-message" role="status">{{ actionMessage }}</p>

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div class="heading-content">
          <span class="eyebrow">
            PUBLISHER WORKSPACE
          </span>

          <h1>My Properties</h1>

          <p>
            View, organize, and monitor the approval
            status of your commercial property listings.
          </p>
        </div>

        <RouterLink
          :to="`${workspaceBase}/properties/create`"
          class="primary-button"
        >
          <Plus :size="18" :stroke-width="2" />
          Add Property
        </RouterLink>
      </div>

      <div class="demo-notice">
        <strong>Listing review</strong>

        <span>
          Drafts and submitted listings are stored in your account. Pending submissions become public after an administrator approves them.
        </span>
      </div>

      <!-- SUMMARY CARDS -->
      <div class="summary-grid">

        <div class="summary-card">
          <div class="summary-icon">
            <Building2 :size="21" />
          </div>

          <div>
            <span>Total Properties</span>
            <strong>{{ totalProperties }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon approved-icon">
            <Building2 :size="21" />
          </div>

          <div>
            <span>Approved</span>
            <strong>{{ approvedCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon pending-icon">
            <Building2 :size="21" />
          </div>

          <div>
            <span>Pending Approval</span>
            <strong>{{ pendingCount }}</strong>
          </div>
        </div>

      </div>

      <!-- PROPERTY TABLE PANEL -->
      <section class="table-panel">

        <div class="panel-header">
          <div>
            <h2>Property Listings</h2>

            <p>
              Browse your submitted and draft properties.
            </p>
          </div>

          <span class="result-count">
            {{ filteredProperties.length }} properties
          </span>
        </div>

        <!-- SEARCH AND FILTERS -->
        <div class="filter-bar">

          <div class="search-container">
            <Search :size="18" class="search-icon" />

            <InputText
              v-model="search"
              aria-label="Search properties"
              placeholder="Search properties..."
              class="search-input"
            />
          </div>

          <Select
            v-model="statusFilter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="All Statuses"
            aria-label="Filter by status"
            class="status-select"
          />

          <button
            type="button"
            class="reset-button"
            @click="clearFilters"
          >
            <RotateCcw :size="16" />
            Reset
          </button>

        </div>

        <!-- PROPERTIES DATA TABLE -->
        <DataTable
          :value="filteredProperties"
          data-key="id"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          striped-rows
          sort-field="dateCreated"
          :sort-order="-1"
          class="properties-table"
          table-style="min-width: 850px"
        >

          <!-- PROPERTY -->
          <Column
            field="title"
            header="Property"
            sortable
          >
            <template #body="{ data }">
              <div class="property-cell">

                <!-- PROPERTY IMAGE -->
                <img
                  v-if="data.images.length > 0 && data.images[0]"
                  :src="data.images[0]"
                  :alt="data.title"
                  class="property-image"
                  loading="lazy"
                />

                <!-- NO IMAGE PLACEHOLDER -->
                <div
                  v-else
                  class="property-image-placeholder"
                  role="img"
                  aria-label="Property image unavailable"
                >
                  <Building2 :size="23" />
                </div>

                <div class="property-information">
                  <strong>{{ data.title }}</strong>

                  <span>
                    {{
                      data.location ||
                      'Location not specified'
                    }}
                  </span>

                  <small>{{ data.propertyType }}</small>
                </div>

              </div>
            </template>
          </Column>

          <!-- LISTING TYPE -->
          <Column
            field="listingType"
            header="Listing Type"
            sortable
          />

          <!-- PRICE -->
          <Column
            field="price"
            header="Price"
            sortable
          >
            <template #body="{ data }">
              <div class="price-cell">

                <strong v-if="data.price > 0">
                  {{ formatOwnerPrice(data.price) }}
                </strong>

                <strong
                  v-else
                  class="price-unavailable"
                >
                  Not specified
                </strong>

                <small
                  v-if="
                    data.price > 0 &&
                    data.listingType === 'For Rent'
                  "
                >
                  per month
                </small>

              </div>
            </template>
          </Column>

          <!-- APPROVAL STATUS -->
          <Column
            field="status"
            header="Status"
            sortable
          >
            <template #body="{ data }">
              <Tag
                :value="data.status"
                :severity="getSeverity(data.status)"
                rounded
              />
            </template>
          </Column>

          <!-- DATE CREATED -->
          <Column
            field="dateCreated"
            header="Date Created"
            sortable
          >
            <template #body="{ data }">
              {{ data.dateCreated }}
            </template>
          </Column>

          <!-- ACTIONS -->
          <Column header="Actions">
            <template #body="{ data }">
              <div class="action-buttons">

                <!-- VIEW: AVAILABLE FOR ALL PROPERTIES -->
                <RouterLink
                  :to="`${workspaceBase}/properties/${data.id}`"
                  class="icon-button"
                  :aria-label="`View details of ${data.title}`"
                  :title="`View ${data.title}`"
                >
                  <Eye :size="17" />
                </RouterLink>

                <button
                  v-if="canEditProperty(data.id)"
                  type="button"
                  class="icon-button delete-button"
                  :aria-label="`Delete ${data.title}`"
                  :title="`Delete ${data.title}`"
                  @click="removeProperty(data.id, data.title)"
                >
                  <Trash2 :size="17" />
                </button>

                <!-- EDIT: BROWSER-SAVED DRAFTS ONLY -->
                <RouterLink
                  v-if="canEditProperty(data.id)"
                  :to="`${workspaceBase}/properties/${data.id}/edit`"
                  class="icon-button edit-button"
                  :aria-label="`Edit ${data.title}`"
                  :title="`Edit ${data.title}`"
                >
                  <Pencil :size="17" />
                </RouterLink>

                <!-- EDIT UNAVAILABLE -->
                <button
                  v-else
                  type="button"
                  class="icon-button"
                  title="Only locally saved Draft listings can be edited"
                  aria-label="Editing unavailable for this listing"
                  disabled
                >
                  <Pencil :size="17" />
                </button>

              </div>
            </template>
          </Column>

          <!-- EMPTY STATE -->
          <template #empty>
            <div class="empty-state">
              <Building2 :size="34" />

              <h3>No properties found</h3>

              <p>
                Try changing your search or selected status.
              </p>

              <button
                type="button"
                class="reset-button"
                @click="clearFilters"
              >
                Clear Filters
              </button>
            </div>
          </template>

        </DataTable>

      </section>

      <!-- FOOTNOTE -->
      <p class="bottom-note">
        All property statuses can be viewed by the owner.
        You can edit listings that are still in Draft status.
        Image uploads and administrator review are handled by the application server.
      </p>

    </main>
  </AppSidebar>
</template>

<style scoped>
/* PAGE CONTAINER */

.properties-page {
  max-width: 1350px;
  margin: 0 auto;
  min-width: 0;
}

/* PAGE HEADING */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.page-header h1 {
  color: #142d4e;
  font-size: clamp(26px, 3vw, 34px);
  letter-spacing: -0.8px;
  margin: 10px 0;
}

.page-header p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

/* ADD PROPERTY BUTTON */

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 18px;
  background: #142d4e;
  border: 1px solid #142d4e;
  border-radius: 9px;
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.primary-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* DEMO NOTICE */

.demo-notice {
  display: flex;
  gap: 12px;
  padding: 15px 18px;
  margin-bottom: 24px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #47617f;
  font-size: 12px;
  line-height: 1.7;
}

.demo-notice strong {
  color: #1d4ed8;
  white-space: nowrap;
}

/* SUMMARY CARDS */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 28px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 17px;
  min-width: 0;
  padding: 22px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 49px;
  height: 49px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #eaf1fc;
  color: #2563eb;
}

.approved-icon {
  background: #dcfce7;
  color: #15803d;
}

.pending-icon {
  background: #fef9c3;
  color: #a16207;
}

.summary-card > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-card span {
  color: #64748b;
  font-size: 12px;
}

.summary-card strong {
  color: #142d4e;
  font-size: 26px;
  font-weight: 800;
}

/* TABLE PANEL */

.table-panel {
  min-width: 0;
  padding: 27px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.panel-header h2 {
  color: #142d4e;
  font-size: 20px;
  margin: 0 0 8px;
}

.panel-header p {
  color: #64748b;
  font-size: 12px;
  margin: 0;
}

.result-count {
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}

/* FILTERS */

.filter-bar {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 24px;
}

.search-container {
  position: relative;
  flex: 1;
  min-width: 0;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 14px;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding-left: 42px;
}

.status-select {
  width: 190px;
  flex-shrink: 0;
}

.search-input,
.status-select {
  min-height: 44px;
}

.reset-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 15px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.reset-button:hover {
  border-color: #93c5fd;
  color: #2563eb;
}

/* PRIMEVUE TABLE */

.properties-table {
  width: 100%;
}

.properties-table :deep(.p-datatable-table-container) {
  overflow-x: auto;
}

.properties-table :deep(.p-datatable-thead > tr > th) {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  padding: 15px;
}

.properties-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px 15px;
  color: #334155;
  font-size: 12px;
  vertical-align: middle;
}

/* PROPERTY CELL */

.property-cell {
  display: flex;
  align-items: center;
  gap: 13px;
  min-width: 230px;
}

.property-image,
.property-image-placeholder {
  width: 74px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 8px;
}

.property-image {
  object-fit: cover;
  background: #f1f5f9;
}

.property-image-placeholder {
  display: grid;
  place-items: center;
  border: 1px solid #dbeafe;
  background: #eaf1fc;
  color: #2563eb;
}

.property-information {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.property-information strong {
  color: #142d4e;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.property-information span,
.property-information small {
  color: #94a3b8;
  font-size: 11px;
  overflow-wrap: anywhere;
}

/* PRICE CELL */

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.price-cell strong {
  color: #142d4e;
  white-space: nowrap;
}

.price-cell .price-unavailable {
  color: #94a3b8;
  font-weight: 500;
}

.price-cell small {
  color: #94a3b8;
}

/* ACTION BUTTONS */

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-message { margin: 0 0 16px; color: #334155; font-size: 13px; }
.delete-button { color: #b91c1c; }

.icon-button {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.icon-button:hover:not(:disabled) {
  background: #eaf1fc;
  color: #2563eb;
  border-color: #bfdbfe;
}

.edit-button {
  color: #2563eb;
}

.edit-button:hover {
  background: #eaf1fc;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.icon-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* EMPTY STATE */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 45px 10px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  text-align: center;
  font-size: 12px;
}

/* FOOTNOTE */

.bottom-note {
  margin-top: 20px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.7;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-card {
    padding: 17px;
  }
}

@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .filter-bar {
    flex-wrap: wrap;
  }

  .search-container {
    flex-basis: 100%;
  }

  .status-select {
    width: auto;
    flex: 1;
  }

  .table-panel {
    padding: 18px 12px;
  }

  .panel-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .demo-notice {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
