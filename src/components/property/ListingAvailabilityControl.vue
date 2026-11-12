<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarCheck } from '@lucide/vue'
import { AVAILABILITY_MESSAGES, availabilityState, type WorkspaceListingStatus } from '@/utils/listingRules'
import type { ListingAvailability } from '@/types/property'

const props = defineProps<{
  listing: {
    id: number
    status: WorkspaceListingStatus
    availability: ListingAvailability
    availabilityConfirmedAt: string | null
  }
  /** Saves the new availability; resolves to an error message, or '' on success. */
  save: (availability: ListingAvailability) => Promise<string>
  /** Shown once after the one-click confirmation link in the reminder email. */
  confirmedFromEmail?: boolean
}>()

const state = computed(() => availabilityState(props.listing))
const busy = ref(false)
const message = ref(props.confirmedFromEmail ? 'Thanks! The listing is confirmed as still available.' : '')
const isError = ref(false)

const confirmedOn = computed(() =>
  props.listing.availabilityConfirmedAt
    ? new Date(props.listing.availabilityConfirmedAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    : '',
)

async function update(availability: ListingAvailability) {
  busy.value = true
  message.value = ''
  const error = await props.save(availability)
  isError.value = Boolean(error)
  message.value = error || (availability === 'available'
    ? 'Thanks! The listing is confirmed as still available.'
    : `Marked as ${availability}. It is now hidden from the public.`)
  busy.value = false
}
</script>

<template>
  <section class="availability" :class="`availability--${state}`" aria-labelledby="availability-heading">
    <div class="availability__heading">
      <CalendarCheck :size="19" aria-hidden="true" />
      <h2 id="availability-heading">Availability</h2>
    </div>

    <p class="availability__state">{{ AVAILABILITY_MESSAGES[state] }}</p>
    <p v-if="confirmedOn && state !== 'not-published'" class="availability__date">Last confirmed {{ confirmedOn }}</p>

    <div v-if="state !== 'not-published'" class="availability__actions">
      <button type="button" class="availability__primary" :disabled="busy" @click="update('available')">
        {{ listing.availability === 'available' ? 'Still available' : 'Available again' }}
      </button>
      <button v-if="listing.availability !== 'rented'" type="button" :disabled="busy" @click="update('rented')">Mark as rented</button>
      <button v-if="listing.availability !== 'sold'" type="button" :disabled="busy" @click="update('sold')">Mark as sold</button>
    </div>

    <p v-if="message" class="availability__message" :class="{ 'availability__message--error': isError }" role="status">{{ message }}</p>
  </section>
</template>

<style scoped>
.availability {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
}

.availability--needs-confirmation,
.availability--hidden-unconfirmed {
  border-color: #fde68a;
  background: #fffbeb;
}

.availability__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2563eb;
}

h2 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

.availability__state {
  margin: 10px 0 4px;
  color: #334155;
  font-size: 14px;
}

.availability__date {
  margin: 0;
  color: #5e6d82;
  font-size: 12px;
}

.availability__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.availability__actions button {
  padding: 9px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #142d4e;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.availability__actions .availability__primary {
  border-color: #166534;
  background: #166534;
  color: #ffffff;
}

.availability__actions button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.availability__message {
  margin: 10px 0 0;
  color: #166534;
  font-size: 13px;
}

.availability__message--error {
  color: #b91c1c;
}
</style>
