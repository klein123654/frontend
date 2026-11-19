<script setup lang="ts">
import type { BrokerCredentialRecord } from '@/services/brokerCredentials'
import { formatDate } from '@/utils/format'

/** Read-only list of a broker's submitted credentials, for administrators to check. */
defineProps<{ record: Partial<BrokerCredentialRecord> }>()

function expiryNote(date: string | null | undefined): string {
  if (!date) return 'No validity date given'
  const days = Math.ceil((new Date(`${date.slice(0, 10)}T00:00:00`).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return `Expired ${formatDate(date)}`
  return `Valid until ${formatDate(date)}${days <= 30 ? ` (${days} day${days === 1 ? '' : 's'} left)` : ''}`
}

function expired(date: string | null | undefined): boolean {
  return !date || new Date(`${date.slice(0, 10)}T23:59:59`).getTime() < Date.now()
}
</script>

<template>
  <dl class="credential-details" data-testid="broker-credential-details">
    <div><dt>PRC license</dt><dd>{{ record.license_number || 'Not given' }} <small :class="{ bad: expired(record.prc_valid_until) }">{{ expiryNote(record.prc_valid_until) }}</small></dd></div>
    <div><dt>DHSUD registration</dt><dd>{{ record.dhsud_registration_number || 'Not given' }} <small :class="{ bad: expired(record.dhsud_valid_until) }">{{ expiryNote(record.dhsud_valid_until) }}</small></dd></div>
    <div><dt>Firm / brokerage</dt><dd>{{ record.firm_name || 'Not given' }}</dd></div>
    <div><dt>Position</dt><dd>{{ record.firm_position || 'Not given' }}</dd></div>
    <div><dt>Office address</dt><dd>{{ record.firm_address || 'Not given' }}</dd></div>
    <div><dt>Firm DTI / SEC no.</dt><dd>{{ record.firm_registration_number || 'Not given' }}</dd></div>
    <div class="wide"><dt>Affiliations</dt><dd>{{ record.affiliations?.length ? record.affiliations.join(', ') : 'None given' }}</dd></div>
  </dl>
</template>

<style scoped>
.credential-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;
  margin: 12px 0;
}

.credential-details div {
  display: grid;
  gap: 2px;
}

.credential-details .wide {
  grid-column: 1 / -1;
}

dt {
  color: #5e6d82;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

dd {
  margin: 0;
  color: #142d4e;
  font-weight: 600;
}

small {
  display: block;
  color: #166534;
  font-weight: 600;
}

small.bad {
  color: #b91c1c;
}

@media (max-width: 640px) {
  .credential-details {
    grid-template-columns: 1fr;
  }
}
</style>
