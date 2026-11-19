<script setup lang="ts">
import { computed } from 'vue'
import { Building2 } from '@lucide/vue'
import type { BrokerCredentialsInfo } from '@/types/property'
import { formatDate } from '@/utils/format'

/** A broker's firm, PRC and DHSUD credentials and affiliations, shown to the public. */
const props = defineProps<{ broker: BrokerCredentialsInfo }>()
const credentialsLapsed = computed(() => ['expired', 'missing'].includes(props.broker.credentialStatus))
</script>

<template>
  <div class="broker-credentials">
    <div v-if="broker.firm" class="credentials__firm" data-testid="broker-firm">
      <Building2 :size="17" aria-hidden="true" />
      <div>
        <strong>{{ broker.firm.name }}</strong>
        <span v-if="broker.firm.position">{{ broker.firm.position }}</span>
        <span v-if="broker.firm.address">{{ broker.firm.address }}</span>
        <span v-if="broker.firm.registrationNumber">Firm registration: {{ broker.firm.registrationNumber }}</span>
      </div>
    </div>

    <dl class="credentials__credentials" data-testid="broker-credentials">
      <div>
        <dt>PRC license</dt>
        <dd>{{ broker.licenseNumber }}<small v-if="broker.prcValidUntil"> · valid until {{ formatDate(broker.prcValidUntil) }}</small></dd>
      </div>
      <div>
        <dt>DHSUD registration</dt>
        <dd>{{ broker.dhsudRegistrationNumber ?? 'Not given' }}<small v-if="broker.dhsudValidUntil"> · valid until {{ formatDate(broker.dhsudValidUntil) }}</small></dd>
      </div>
    </dl>

    <ul v-if="broker.affiliations.length" class="credentials__affiliations" aria-label="Professional affiliations">
      <li v-for="name in broker.affiliations" :key="name">{{ name }}</li>
    </ul>

    <p v-if="credentialsLapsed" class="credentials__lapsed" role="note">
      This broker’s registration is being renewed. ButuanSpaces will confirm the renewed PRC and DHSUD details.
    </p>
  </div>
</template>

<style scoped>
.broker-credentials {
  display: grid;
  gap: 10px;
  width: 100%;
}

.credentials__firm {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #334155;
  font-size: 14px;
}

.credentials__firm svg {
  flex: none;
  margin-top: 2px;
  color: #2563eb;
}

.credentials__firm div {
  display: grid;
  gap: 2px;
}

.credentials__firm strong {
  color: #142d4e;
}

.credentials__credentials {
  display: grid;
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border-radius: 9px;
  background: #f8fafc;
  font-size: 13px;
}

.credentials__credentials div {
  display: grid;
  gap: 1px;
}

.credentials__credentials dt {
  color: #5e6d82;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.credentials__credentials dd {
  margin: 0;
  color: #142d4e;
  font-weight: 600;
}

.credentials__credentials small {
  color: #5e6d82;
  font-weight: 500;
}

.credentials__affiliations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.credentials__affiliations li {
  padding: 4px 9px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1e40af;
  font-size: 12px;
  font-weight: 600;
}

.credentials__lapsed {
  margin: 0;
  padding: 10px 12px;
  border-radius: 9px;
  background: #fef3c7;
  color: #92400e;
  font-size: 13px;
}

</style>
