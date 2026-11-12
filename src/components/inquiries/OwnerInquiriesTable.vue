<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { Eye, MessageSquare, UserRound } from '@lucide/vue'
import {
  aiPrioritySeverity as getAiPrioritySeverity,
  inquiryStatusSeverity as getSeverity,
  type OwnerInquiry,
} from '@/data/owner/ownerInquiries'

defineProps<{
  inquiries: OwnerInquiry[]
  propertyTitle: (propertyId: number) => string
  workspaceBase: string
}>()

const emit = defineEmits<{
  view: [inquiry: OwnerInquiry]
  'clear-filters': []
}>()
</script>

<template>
  <DataTable
    :value="inquiries"
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
          {{ propertyTitle(data.propertyId) }}
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

    <Column header="Lead Priority">
      <template #body="{ data }">
        <Tag
          :value="data.aiPriority"
          :severity="getAiPrioritySeverity(data.aiPriority)"
          rounded
        />
      </template>
    </Column>

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
          @click="emit('view', data)"
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
          @click="emit('clear-filters')"
        >
          Clear Filters
        </button>
      </div>
    </template>

  </DataTable>
</template>

<style scoped>
.inquiries-table {
  width: 100%;
}

.inquiries-table :deep(.p-datatable-table-container) {
  overflow-x: auto;
}

.inquiries-table :deep(.p-datatable-thead > tr > th) {
  padding: 15px;
  background: #f8fafc;
  color: #5e6d82;
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
  color: #5e6d82;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 45px 12px;
  color: #5e6d82;
}

.empty-state h3 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
}
</style>
