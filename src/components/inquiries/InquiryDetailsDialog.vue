<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import { ArrowRight, Building2, CalendarDays, Clock3, Info, Mail, MessageSquare, Phone, UserRound } from '@lucide/vue'
import { INQUIRY_STATUSES, type InquiryStatus, type OwnerInquiry } from '@/data/owner/ownerInquiries'

defineProps<{
  inquiry: OwnerInquiry | undefined
  propertyTitle: string
  propertyLink: string
  feedbackMessage: string
  feedbackIsWarning: boolean
}>()

const visible = defineModel<boolean>('visible', { required: true })

const emit = defineEmits<{
  'change-status': [inquiryId: number, status: InquiryStatus]
  'open-conversation': []
}>()

const statusOptions = INQUIRY_STATUSES.map((status) => ({ label: status, value: status }))

function onStatusSelected(inquiryId: number, value: InquiryStatus | null) {
  if (value !== null) emit('change-status', inquiryId, value)
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Inquiry Details"
    :style="{ width: 'min(560px, 95vw)' }"
    :draggable="false"
    :dismissable-mask="true"
  >
    <div v-if="inquiry" class="dialog-content">
      <section class="dialog-section">
        <h3>
          <UserRound :size="17" />
          Customer Information
        </h3>

        <div class="detail-pair">
          <span>Name</span>
          <strong>{{ inquiry.customerName }}</strong>
        </div>
        <div class="detail-pair">
          <span>Email</span>
          <strong>{{ inquiry.customerEmail }}</strong>
        </div>
        <div class="detail-pair">
          <span>Phone</span>
          <strong>{{ inquiry.customerPhone }}</strong>
        </div>
        <div class="detail-pair">
          <span>Preferred Contact</span>
          <strong>{{ inquiry.contactPreference }}</strong>
        </div>
      </section>

      <section class="dialog-section">
        <h3>
          <Building2 :size="17" />
          Property Information
        </h3>

        <RouterLink :to="propertyLink" class="dialog-property-link" @click="visible = false">
          {{ propertyTitle }}
          <ArrowRight :size="16" />
        </RouterLink>

        <div class="detail-pair date-pair">
          <span>
            <CalendarDays :size="15" />
            Received
          </span>
          <strong>{{ inquiry.dateReceived }}</strong>
        </div>
      </section>

      <section class="dialog-section">
        <h3>AI Lead Summary</h3>
        <p class="ai-summary">{{ inquiry.aiSummary || 'Not scored yet.' }}</p>
      </section>

      <section class="dialog-section">
        <h3>
          <MessageSquare :size="17" />
          Customer Message
        </h3>
        <strong class="message-subject">{{ inquiry.subject }}</strong>
        <div class="message-box">{{ inquiry.message }}</div>
      </section>

      <button type="button" class="conversation-open-button" @click="emit('open-conversation')">
        View Conversation
      </button>

      <section class="dialog-section">
        <h3>
          <Clock3 :size="17" />
          Manage Inquiry
        </h3>

        <label class="status-label" for="inquiry-status-select">Inquiry Status</label>
        <Select
          :model-value="inquiry.status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
          class="dialog-status-select"
          input-id="inquiry-status-select"
          aria-label="Change inquiry status"
          @update:model-value="(value) => onStatusSelected(inquiry!.id, value as InquiryStatus | null)"
        />

        <p class="status-help">Status changes are saved to the application database.</p>

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
        <span>Use the contact information provided by the customer to follow up.</span>
      </div>

      <div class="contact-icons">
        <Mail :size="16" />
        <span>Email</span>
        <Phone :size="16" />
        <span>Phone</span>
      </div>
    </div>

    <template #footer>
      <button type="button" class="close-button" @click="visible = false">Close</button>
    </template>
  </Dialog>
</template>

<style scoped>
.conversation-open-button {border:0;border-radius:7px;padding:10px 15px;background:#142d4e;color:white;font-weight:700;cursor:pointer}

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
  color: #5e6d82;
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

.ai-summary {
  margin: 0;
  padding: 14px 16px;
  border-left: 3px solid #087e75;
  background: #eff8f6;
  color: #285b56;
  font-size: 13px;
  line-height: 1.65;
}

.status-label {
  color: #5e6d82;
  font-size: 12px;
  font-weight: 600;
}

.dialog-status-select {
  width: 100%;
}

.status-help {
  margin: 0;
  color: #5e6d82;
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
  color: #5e6d82;
  font-size: 11px;
}

.contact-icons svg {
  margin-left: 8px;
}

.close-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 650px) {
  .detail-pair {
    flex-direction: column;
    gap: 4px;
  }

  .detail-pair strong {
    text-align: left;
  }
}

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

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 6px 0;
}

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
</style>
