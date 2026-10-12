
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'

import {
  MessageSquare,
  Mail,
  Clock3,
  CheckCircle2,
  Search,
  RotateCcw,
  Eye,
  Building2,
  ArrowRight,
  Phone,
  CalendarDays,
  UserRound,
  Info
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'

import {
  type InquiryStatus,
  type OwnerInquiry
} from '@/data/owner/ownerInquiries'

import { allOwnerProperties, loadOwnerProperties } from '@/stores/ownerProperties'

import {
  allOwnerInquiries,
  loadOwnerInquiries,
  updateInquiryStatus,
} from '@/stores/ownerInquiries'

const workspaceBase = usePublisherBasePath()
onMounted(() => Promise.all([loadOwnerProperties(), loadOwnerInquiries()]))

// SEARCH AND FILTERS

const search = ref('')
const statusFilter = ref<InquiryStatus | null>(null)

const statusOptions: {
  label: string
  value: InquiryStatus | null
}[] = [
  { label: 'All Statuses', value: null },
  { label: 'New', value: 'New' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' }
]

const editableStatuses: {
  label: string
  value: InquiryStatus
}[] = [
  { label: 'New', value: 'New' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' }
]

// PROPERTY LOOKUP

function getPropertyTitle(propertyId: number): string {
  return (
    allOwnerProperties.value.find(
      (property) => property.id === propertyId
    )?.title ?? 'Property unavailable'
  )
}

// INQUIRY LIST

const filteredInquiries = computed(() => {
  const query = search.value.trim().toLowerCase()

  return allOwnerInquiries.value.filter((inquiry) => {
    const propertyTitle = getPropertyTitle(inquiry.propertyId)

    const matchesSearch =
      !query ||
      inquiry.customerName.toLowerCase().includes(query) ||
      inquiry.customerEmail.toLowerCase().includes(query) ||
      inquiry.subject.toLowerCase().includes(query) ||
      inquiry.message.toLowerCase().includes(query) ||
      propertyTitle.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter.value === null ||
      inquiry.status === statusFilter.value

    return matchesSearch && matchesStatus
  })
})

// SUMMARY COUNTS

const totalCount = computed(
  () => allOwnerInquiries.value.length
)

const newCount = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'New'
    ).length
)

const inProgressCount = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'In Progress'
    ).length
)

const resolvedCount = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'Resolved'
    ).length
)

// STATUS BADGES

function getSeverity(status: InquiryStatus) {
  switch (status) {
    case 'New':
      return 'info'
    case 'In Progress':
      return 'warn'
    case 'Resolved':
      return 'success'
    default:
      return 'secondary'
  }
}

// DETAILS DIALOG

const detailsVisible = ref(false)
const selectedInquiryId = ref<number | null>(null)

const selectedInquiry = computed(() =>
  allOwnerInquiries.value.find(
    (inquiry) => inquiry.id === selectedInquiryId.value
  )
)

function openInquiry(inquiry: OwnerInquiry) {
  selectedInquiryId.value = inquiry.id
  feedbackMessage.value = ''
  detailsVisible.value = true
}

// STATUS UPDATES

const feedbackMessage = ref('')
const feedbackIsWarning = ref(false)

async function changeStatus(
  inquiryId: number,
  status: InquiryStatus
) {
  const updated = await updateInquiryStatus(inquiryId, status)
  feedbackMessage.value = updated ? 'Inquiry status updated successfully.' : 'Unable to update this inquiry.'
  feedbackIsWarning.value = !updated
}

async function handleStatusChange(
  inquiryId: number,
  status: InquiryStatus | null
) {
  if (status !== null) {
    await changeStatus(inquiryId, status)
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
    <main class="inquiries-page">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <span class="eyebrow">
            PUBLISHER WORKSPACE
          </span>

          <h1>Owner Inquiries</h1>

          <p>
            Review property inquiries, read customer messages,
            and track their progress.
          </p>
        </div>

        <RouterLink
          :to="`${workspaceBase}/properties`"
          class="properties-link"
        >
          <Building2 :size="17" />
          My Properties
          <ArrowRight :size="16" />
        </RouterLink>
      </div>

      <div class="demo-notice">
        <Info :size="18" />

        <p>
          Inquiry records are submitted by customers and stored with the related property.
        </p>
      </div>

      <!-- SUMMARY -->
      <div class="summary-grid">

        <div class="summary-card">
          <div class="summary-icon">
            <MessageSquare :size="21" />
          </div>

          <div class="summary-content">
            <span>Total Inquiries</span>
            <strong>{{ totalCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon new-icon">
            <Mail :size="21" />
          </div>

          <div class="summary-content">
            <span>New</span>
            <strong>{{ newCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon progress-icon">
            <Clock3 :size="21" />
          </div>

          <div class="summary-content">
            <span>In Progress</span>
            <strong>{{ inProgressCount }}</strong>
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-icon closed-icon">
            <CheckCircle2 :size="21" />
          </div>

          <div class="summary-content">
            <span>Resolved</span>
            <strong>{{ resolvedCount }}</strong>
          </div>
        </div>

      </div>

      <!-- INQUIRIES PANEL -->
      <section class="table-panel">

        <div class="panel-header">
          <div>
            <h2>Inquiry Management</h2>

            <p>
              Track inquiries related to your commercial properties.
            </p>
          </div>

          <span class="result-count">
            {{ filteredInquiries.length }} inquiries
          </span>
        </div>

        <!-- SEARCH AND FILTERS -->
        <div class="filter-bar">

          <div class="search-container">
            <Search
              :size="18"
              class="search-icon"
            />

            <InputText
              v-model="search"
              class="search-input"
              placeholder="Search inquiries..."
              aria-label="Search inquiries"
            />
          </div>

          <Select
            v-model="statusFilter"
            :options="statusOptions"
            option-label="label"
            option-value="value"
            placeholder="All Statuses"
            aria-label="Filter inquiries by status"
            class="status-filter"
          />

          <button
            type="button"
            class="secondary-button"
            @click="clearFilters"
          >
            <RotateCcw :size="16" />
            Reset Filters
          </button>

        </div>

        <!-- FEEDBACK -->
        <div
          v-if="feedbackMessage"
          class="feedback-message"
          :class="{ warning: feedbackIsWarning }"
          role="status"
        >
          {{ feedbackMessage }}
        </div>

        <!-- TABLE -->
        <DataTable
          :value="filteredInquiries"
          data-key="id"
          paginator
          :rows="5"
          :rows-per-page-options="[5, 10, 20]"
          striped-rows
          sort-field="dateReceived"
          :sort-order="-1"
          table-style="min-width: 850px"
          class="inquiries-table"
        >

          <!-- INQUIRER -->
          <Column
            field="customerName"
            header="Inquirer"
            sortable
          >
            <template #body="{ data }">
              <div class="inquirer-cell">
                <div class="avatar">
                  <UserRound :size="19" />
                </div>

                <div class="inquirer-info">
                  <strong>{{ data.customerName }}</strong>
                  <span>{{ data.customerEmail }}</span>
                </div>
              </div>
            </template>
          </Column>

          <!-- PROPERTY -->
          <Column
            field="propertyId"
            header="Property"
          >
            <template #body="{ data }">
              <RouterLink
                :to="`${workspaceBase}/properties/${data.propertyId}`"
                class="property-link"
              >
                {{ getPropertyTitle(data.propertyId) }}
              </RouterLink>
            </template>
          </Column>

          <!-- SUBJECT -->
          <Column
            field="subject"
            header="Subject"
            sortable
          >
            <template #body="{ data }">
              <span class="subject-text">
                {{ data.subject }}
              </span>
            </template>
          </Column>

          <!-- DATE -->
          <Column
            field="dateReceived"
            header="Received"
            sortable
          />

          <!-- STATUS -->
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

          <!-- ACTIONS -->
          <Column header="Actions">
            <template #body="{ data }">
              <button
                type="button"
                class="view-button"
                :aria-label="`View inquiry from ${data.customerName}`"
                :title="`View inquiry from ${data.customerName}`"
                @click="openInquiry(data)"
              >
                <Eye :size="17" />
                View
              </button>
            </template>
          </Column>

          <!-- EMPTY STATE -->
          <template #empty>
            <div class="empty-state">
              <MessageSquare :size="34" />

              <h3>No inquiries found</h3>

              <p>
                Try changing your search or status filter.
              </p>

              <button
                type="button"
                class="secondary-button"
                @click="clearFilters"
              >
                Clear Filters
              </button>
            </div>
          </template>

        </DataTable>
      </section>

      <div class="bottom-actions">
        <p>
          Update a status after following up with the customer.
        </p>
      </div>

      <!-- INQUIRY DETAILS DIALOG -->
      <Dialog
        v-model:visible="detailsVisible"
        modal
        header="Inquiry Details"
        :style="{ width: 'min(560px, 95vw)' }"
        :draggable="false"
        :dismissable-mask="true"
      >
        <div
          v-if="selectedInquiry"
          class="dialog-content"
        >

          <!-- CUSTOMER -->
          <section class="dialog-section">
            <h3>
              <UserRound :size="17" />
              Customer Information
            </h3>

            <div class="detail-pair">
              <span>Name</span>
              <strong>
                {{ selectedInquiry.customerName }}
              </strong>
            </div>

            <div class="detail-pair">
              <span>Email</span>
              <strong>
                {{ selectedInquiry.customerEmail }}
              </strong>
            </div>

            <div class="detail-pair">
              <span>Phone</span>
              <strong>
                {{ selectedInquiry.customerPhone }}
              </strong>
            </div>

            <div class="detail-pair">
              <span>Preferred Contact</span>
              <strong>
                {{ selectedInquiry.contactPreference }}
              </strong>
            </div>
          </section>

          <!-- PROPERTY -->
          <section class="dialog-section">
            <h3>
              <Building2 :size="17" />
              Property Information
            </h3>

            <RouterLink
              :to="`${workspaceBase}/properties/${selectedInquiry.propertyId}`"
              class="dialog-property-link"
              @click="detailsVisible = false"
            >
              {{ getPropertyTitle(selectedInquiry.propertyId) }}
              <ArrowRight :size="16" />
            </RouterLink>

            <div class="detail-pair date-pair">
              <span>
                <CalendarDays :size="15" />
                Received
              </span>

              <strong>
                {{ selectedInquiry.dateReceived }}
              </strong>
            </div>
          </section>

          <!-- MESSAGE -->
          <section class="dialog-section">
            <h3>
              <MessageSquare :size="17" />
              Customer Message
            </h3>

            <strong class="message-subject">
              {{ selectedInquiry.subject }}
            </strong>

            <div class="message-box">
              {{ selectedInquiry.message }}
            </div>
          </section>

          <!-- CHANGE STATUS -->
          <section class="dialog-section">
            <h3>
              <Clock3 :size="17" />
              Manage Inquiry
            </h3>

            <label class="status-label">
              Inquiry Status
            </label>

            <Select
              :model-value="selectedInquiry.status"
              :options="editableStatuses"
              option-label="label"
              option-value="value"
              class="dialog-status-select"
              aria-label="Change inquiry status"
              @update:model-value="
                (value) =>
                  handleStatusChange(
                    selectedInquiry!.id,
                    value as InquiryStatus
                  )
              "
            />

            <p class="status-help">
              Status changes are saved to the application database.
            </p>

            <div
              v-if="feedbackMessage"
              class="feedback-message"
              :class="{ warning: feedbackIsWarning }"
              role="status"
            >
              {{ feedbackMessage }}
            </div>
          </section>

          <div class="contact-note">
            <Info :size="17" />

            <span>
              Use the contact information provided by the customer to follow up.
            </span>
          </div>

          <!-- CONTACT DISPLAY -->
          <div class="contact-icons">
            <Mail :size="16" />
            <span>Email</span>

            <Phone :size="16" />
            <span>Phone</span>
          </div>

        </div>

        <template #footer>
          <button
            type="button"
            class="close-button"
            @click="detailsVisible = false"
          >
            Close
          </button>
        </template>
      </Dialog>

    </main>
  </AppSidebar>
</template>

<style scoped>
.inquiries-page {
  width: 100%;
  max-width: 1350px;
  min-width: 0;
  margin: 0 auto;
}

/* HEADER */

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
  margin: 10px 0;
  color: #142d4e;
  font-size: clamp(26px, 3vw, 34px);
  letter-spacing: -0.8px;
}

.page-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.properties-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 17px;
  border: 1px solid #142d4e;
  border-radius: 9px;
  background: #142d4e;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.properties-link:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* DEMO NOTICE */

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 18px;
  margin-bottom: 24px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #47617f;
}

.demo-notice > svg {
  flex-shrink: 0;
  color: #2563eb;
}

.demo-notice p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}

/* SUMMARY CARDS */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 28px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
  padding: 22px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: white;
}

.summary-icon {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #eaf1fc;
  color: #2563eb;
}

.new-icon {
  background: #dbeafe;
  color: #1d4ed8;
}

.progress-icon {
  background: #fef9c3;
  color: #a16207;
}

.closed-icon {
  background: #dcfce7;
  color: #15803d;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.summary-content span {
  color: #64748b;
  font-size: 12px;
}

.summary-content strong {
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
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0 0 8px;
  color: #142d4e;
  font-size: 20px;
}

.panel-header p,
.result-count {
  margin: 0;
  color: #64748b;
  font-size: 12px;
}

.result-count {
  white-space: nowrap;
}

/* FILTER BAR */

.filter-bar {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 22px;
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
  min-height: 44px;
  padding-left: 42px;
}

.status-filter {
  width: 180px;
  min-height: 44px;
  flex-shrink: 0;
}

.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: white;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button:hover {
  border-color: #93c5fd;
  color: #2563eb;
}

/* TABLE */

.inquiries-table {
  width: 100%;
}

.inquiries-table :deep(.p-datatable-table-container) {
  overflow-x: auto;
}

.inquiries-table :deep(.p-datatable-thead > tr > th) {
  padding: 15px;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.inquiries-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px 15px;
  color: #334155;
  font-size: 12px;
  vertical-align: middle;
}

.inquirer-cell {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 190px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #eaf1fc;
  color: #2563eb;
}

.inquirer-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.inquirer-info strong {
  color: #142d4e;
  font-size: 12px;
}

.inquirer-info span {
  color: #94a3b8;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.property-link {
  color: #2563eb;
  text-decoration: none;
  font-weight: 600;
  line-height: 1.6;
}

.property-link:hover {
  text-decoration: underline;
}

.subject-text {
  display: block;
  max-width: 200px;
  color: #334155;
  line-height: 1.6;
}

.view-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.view-button:hover {
  background: #dbeafe;
}

/* FEEDBACK */

.feedback-message {
  padding: 11px 14px;
  margin-bottom: 17px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;
  color: #166534;
  font-size: 12px;
  line-height: 1.6;
}

.feedback-message.warning {
  border-color: #fde68a;
  background: #fffbeb;
  color: #92400e;
}

/* EMPTY STATE */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 45px 12px;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

/* BOTTOM ACTIONS */

.bottom-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 20px;
}

.bottom-actions p {
  margin: 0;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.reset-demo-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.reset-demo-button:hover {
  border-color: #94a3b8;
  color: #334155;
}

/* DETAILS DIALOG */

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 6px 0;
}

.dialog-section {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.dialog-section + .dialog-section {
  padding-top: 20px;
  border-top: 1px solid #edf2f7;
}

.dialog-section h3 {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 4px;
  color: #142d4e;
  font-size: 14px;
}

.dialog-section h3 svg {
  color: #2563eb;
}

.detail-pair {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
  line-height: 1.6;
}

.detail-pair > span {
  color: #94a3b8;
}

.detail-pair strong {
  color: #334155;
  text-align: right;
  overflow-wrap: anywhere;
}

.date-pair {
  margin-top: 3px;
}

.date-pair > span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.dialog-property-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2563eb;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

.dialog-property-link:hover {
  text-decoration: underline;
}

.message-subject {
  color: #142d4e;
  font-size: 13px;
}

.message-box {
  padding: 17px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.status-label {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.dialog-status-select {
  width: 100%;
}

.status-help {
  margin: 0;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

.contact-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  background: #eff6ff;
  color: #47617f;
  font-size: 11px;
  line-height: 1.7;
}

.contact-note svg {
  flex-shrink: 0;
  color: #2563eb;
}

.contact-icons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #94a3b8;
  font-size: 11px;
}

.contact-icons svg {
  margin-left: 8px;
}

/* DIALOG FOOTER */

.close-button {
  padding: 10px 20px;
  border: 1px solid #142d4e;
  border-radius: 8px;
  background: #142d4e;
  color: white;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.close-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .properties-link {
    width: 100%;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .summary-card {
    padding: 17px;
  }

  .filter-bar {
    flex-wrap: wrap;
  }

  .search-container {
    flex-basis: 100%;
  }

  .status-filter {
    flex: 1;
    width: auto;
  }

  .table-panel {
    padding: 18px 12px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-pair {
    flex-direction: column;
    gap: 4px;
  }

  .detail-pair strong {
    text-align: left;
  }
}
</style>
