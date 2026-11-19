<script setup lang="ts">
import { computed, ref } from 'vue'
import { Info } from '@lucide/vue'
import { DEFAULT_AFFILIATIONS, DEFAULT_DHSUD_NOTICE, type BrokerCredentialForm } from '@/services/brokerCredentials'

/**
 * Inputs for a broker's PRC licence, DHSUD registration and firm details.
 * Used inside the publisher application and the broker profile forms.
 */
const props = withDefaults(defineProps<{
  idPrefix?: string
  dhsudNotice?: string
  suggestedAffiliations?: string[]
}>(), {
  idPrefix: 'broker',
  dhsudNotice: DEFAULT_DHSUD_NOTICE,
  suggestedAffiliations: () => DEFAULT_AFFILIATIONS,
})

const form = defineModel<BrokerCredentialForm>({ required: true })
const otherAffiliation = ref('')
const today = new Date().toISOString().slice(0, 10)
const id = (name: string) => `${props.idPrefix}-${name}`

const otherAffiliations = computed(() => form.value.affiliations.filter((name) => !props.suggestedAffiliations.includes(name)))

function toggleAffiliation(name: string, checked: boolean) {
  form.value.affiliations = checked
    ? [...new Set([...form.value.affiliations, name])]
    : form.value.affiliations.filter((item) => item !== name)
}

function addOtherAffiliation() {
  const name = otherAffiliation.value.trim()
  if (!name || form.value.affiliations.length >= 6) return
  toggleAffiliation(name, true)
  otherAffiliation.value = ''
}
</script>

<template>
  <fieldset class="credentials">
    <legend>PRC license</legend>
    <p class="hint">Renewed every 3 years.</p>
    <div class="row">
      <div>
        <label :for="id('license-number')">PRC license number</label>
        <input :id="id('license-number')" v-model="form.licenseNumber" required maxlength="100" autocomplete="off" />
      </div>
      <div>
        <label :for="id('prc-valid-until')">Valid until</label>
        <input :id="id('prc-valid-until')" v-model="form.prcValidUntil" type="date" required :min="today" />
      </div>
    </div>
  </fieldset>

  <fieldset class="credentials">
    <legend>DHSUD broker registration</legend>
    <p class="hint">Renewed every year.</p>
    <div class="row">
      <div>
        <label :for="id('dhsud-number')">DHSUD registration number</label>
        <input :id="id('dhsud-number')" v-model="form.dhsudRegistrationNumber" required maxlength="100" autocomplete="off" />
      </div>
      <div>
        <label :for="id('dhsud-valid-until')">Valid until</label>
        <input :id="id('dhsud-valid-until')" v-model="form.dhsudValidUntil" type="date" required :min="today" />
      </div>
    </div>
    <p class="dhsud-notice" role="note" data-testid="dhsud-notice">
      <Info :size="16" aria-hidden="true" />
      <span>{{ dhsudNotice }}</span>
    </p>
  </fieldset>

  <fieldset class="credentials">
    <legend>Real estate firm</legend>
    <label :for="id('firm-name')">Firm or brokerage name</label>
    <input :id="id('firm-name')" v-model="form.firmName" required maxlength="255" autocomplete="organization" />
    <div class="row">
      <div>
        <label :for="id('firm-position')">Your position <span>(optional)</span></label>
        <input :id="id('firm-position')" v-model="form.firmPosition" maxlength="120" placeholder="e.g. Managing Broker" autocomplete="organization-title" />
      </div>
      <div>
        <label :for="id('firm-registration')">Firm DTI / SEC registration <span>(optional)</span></label>
        <input :id="id('firm-registration')" v-model="form.firmRegistrationNumber" maxlength="100" autocomplete="off" />
      </div>
    </div>
    <label :for="id('firm-address')">Office address <span>(optional)</span></label>
    <input :id="id('firm-address')" v-model="form.firmAddress" maxlength="255" autocomplete="street-address" />
  </fieldset>

  <fieldset class="credentials">
    <legend>Professional affiliations <span>(optional)</span></legend>
    <label v-for="name in suggestedAffiliations" :key="name" class="check">
      <input type="checkbox" :checked="form.affiliations.includes(name)" @change="toggleAffiliation(name, ($event.target as HTMLInputElement).checked)" />
      {{ name }}
    </label>
    <label v-for="name in otherAffiliations" :key="name" class="check">
      <input type="checkbox" checked @change="toggleAffiliation(name, false)" />
      {{ name }}
    </label>
    <div class="other">
      <label :for="id('other-affiliation')" class="sr-only">Other affiliation</label>
      <input :id="id('other-affiliation')" v-model="otherAffiliation" maxlength="120" placeholder="Other organisation" @keydown.enter.prevent="addOtherAffiliation" />
      <button type="button" class="add" :disabled="!otherAffiliation.trim() || form.affiliations.length >= 6" @click="addOtherAffiliation">Add</button>
    </div>
  </fieldset>
</template>

<style scoped>
.credentials {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

legend {
  padding: 0 4px;
  color: #142d4e;
  font-size: 14px;
  font-weight: 800;
}

legend span,
label span {
  color: #5e6d82;
  font-weight: 400;
}

.hint {
  margin: -4px 0 0;
  color: #5e6d82;
  font-size: 12px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.row > div {
  display: grid;
  gap: 6px;
}

label {
  font-size: 13px;
  font-weight: 700;
}

input:not([type='checkbox']) {
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 9px 11px;
  background: #fff;
  font: inherit;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.other {
  display: flex;
  gap: 8px;
}

.add {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 14px;
  background: #fff;
  color: #142d4e;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.add:disabled {
  opacity: 0.5;
  cursor: default;
}

.dhsud-notice {
  display: flex;
  gap: 8px;
  margin: 4px 0 0;
  padding: 10px 12px;
  border-radius: 8px;
  background: #eff6ff;
  color: #1e3a8a;
  font-size: 13px;
  line-height: 1.5;
}

.dhsud-notice svg {
  flex: none;
  margin-top: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

@media (max-width: 560px) {
  .row {
    grid-template-columns: 1fr;
  }
}
</style>
