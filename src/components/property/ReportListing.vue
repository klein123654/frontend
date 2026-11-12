<script setup lang="ts">
import { ref } from 'vue'
import { Flag } from '@lucide/vue'
import { reportListing } from '@/services/propertyService'

const props = defineProps<{ propertyId: number }>()

const REASONS = [
  'Already rented or sold',
  'Wrong price or details',
  'Fake or misleading listing',
  'Publisher could not be reached',
  'Other',
]

const open = ref(false)
const reason = ref(REASONS[0])
const details = ref('')
const email = ref('')
const sending = ref(false)
const message = ref('')
const isError = ref(false)

async function submit() {
  sending.value = true
  message.value = ''
  try {
    await reportListing(props.propertyId, { reason: reason.value ?? 'Other', details: details.value.trim(), email: email.value.trim() })
    message.value = 'Thank you. An administrator will review this listing.'
    isError.value = false
    open.value = false
    details.value = ''
  } catch (cause) {
    message.value = cause instanceof Error ? cause.message : 'The report could not be sent. Please try again.'
    isError.value = true
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="report">
    <button v-if="!open" type="button" class="report__toggle" :aria-expanded="open" @click="open = true">
      <Flag :size="14" aria-hidden="true" /> Report this listing
    </button>

    <form v-else class="report__form" @submit.prevent="submit">
      <label for="report-reason">What’s wrong with this listing?</label>
      <select id="report-reason" v-model="reason">
        <option v-for="option in REASONS" :key="option">{{ option }}</option>
      </select>

      <label for="report-details">Details <span>(optional)</span></label>
      <textarea id="report-details" v-model="details" rows="3" maxlength="2000"></textarea>

      <label for="report-email">Your email <span>(optional, if we may follow up)</span></label>
      <input id="report-email" v-model="email" type="email" autocomplete="email" />

      <div class="report__actions">
        <button type="submit" class="report__submit" :disabled="sending">{{ sending ? 'Sending…' : 'Send report' }}</button>
        <button type="button" class="report__cancel" @click="open = false">Cancel</button>
      </div>
    </form>

    <p v-if="message" class="report__message" :class="{ 'report__message--error': isError }" role="status">{{ message }}</p>
  </div>
</template>

<style scoped>
.report__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: #475569;
  font: inherit;
  font-size: 13px;
  text-decoration: underline;
  cursor: pointer;
}

.report__form {
  display: grid;
  gap: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.report__form label {
  color: #334155;
  font-size: 13px;
  font-weight: 600;
}

.report__form label span {
  color: #5e6d82;
  font-weight: 400;
}

.report__form select,
.report__form textarea,
.report__form input {
  width: 100%;
  padding: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.report__actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.report__submit,
.report__cancel {
  padding: 9px 14px;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.report__submit {
  border: 0;
  background: #142d4e;
  color: #ffffff;
}

.report__cancel {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #142d4e;
}

.report__message {
  margin: 8px 0 0;
  color: #166534;
  font-size: 13px;
}

.report__message--error {
  color: #b91c1c;
}
</style>
