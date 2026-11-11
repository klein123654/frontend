<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import InquiryConversationPanel from '@/components/inquiries/InquiryConversationPanel.vue'
import InquiryDetailsDialog from '@/components/inquiries/InquiryDetailsDialog.vue'
import InquirySummaryCards from '@/components/inquiries/InquirySummaryCards.vue'
import OwnerInquiriesTable from '@/components/inquiries/OwnerInquiriesTable.vue'

import {
  Search,
  RotateCcw,
  Building2,
  ArrowRight,
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

// DETAILS DIALOG

const detailsVisible = ref(false)
const conversationVisible = ref(false)
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

function openConversation() {
  detailsVisible.value = false
  conversationVisible.value = true
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

      <InquirySummaryCards :inquiries="allOwnerInquiries" />

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

        <OwnerInquiriesTable
          :inquiries="filteredInquiries"
          :property-title="getPropertyTitle"
          :workspace-base="workspaceBase"
          @view="openInquiry"
          @clear-filters="clearFilters"
        />
      </section>

      <div class="bottom-actions">
        <p>
          Update a status after following up with the customer.
        </p>
      </div>

      <InquiryDetailsDialog
        v-model:visible="detailsVisible"
        :inquiry="selectedInquiry"
        :property-title="selectedInquiry ? getPropertyTitle(selectedInquiry.propertyId) : ''"
        :property-link="selectedInquiry ? `${workspaceBase}/properties/${selectedInquiry.propertyId}` : ''"
        :feedback-message="feedbackMessage"
        :feedback-is-warning="feedbackIsWarning"
        @change-status="changeStatus"
        @open-conversation="openConversation"
      />

      <InquiryConversationPanel v-model:visible="conversationVisible" :inquiry-id="selectedInquiry?.id ?? null" />

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
  color: #5e6d82;
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
  color: #5e6d82;
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
  color: #5e6d82;
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
  color: #5e6d82;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button:hover {
  border-color: #93c5fd;
  color: #2563eb;
}

/* TABLE */

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
  color: #5e6d82;
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
  color: #5e6d82;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.reset-demo-button:hover {
  border-color: #94a3b8;
  color: #334155;
}

/* DIALOG FOOTER */

/* RESPONSIVE */

@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .properties-link {
    width: 100%;
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
}
</style>
