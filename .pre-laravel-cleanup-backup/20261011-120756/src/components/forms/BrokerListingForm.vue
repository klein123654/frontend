<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { BrokerListing, BrokerListingInput } from '@/data/broker/brokerListings'
import type { ListingType, PropertyType } from '@/types/property'

const props = defineProps<{ initial?: BrokerListing; edit?: boolean }>()
const emit = defineEmits<{ save: [payload: BrokerListingInput] }>()
const propertyTypes: PropertyType[] = ['Office Spaces', 'Retail Spaces', 'Warehouses', 'Commercial Lots']
const listingTypes: ListingType[] = ['For Rent', 'For Sale']
const validationMessage = ref('')
const form = reactive({
  title: '', location: '', barangay: '',
  propertyType: 'Office Spaces' as PropertyType,
  listingType: 'For Rent' as ListingType,
  price: 0, area: 0, description: ''
})

watch(() => props.initial, (value) => {
  if (!value) return
  Object.assign(form, {
    title: value.title, location: value.location, barangay: value.barangay,
    propertyType: value.propertyType, listingType: value.listingType,
    price: value.price, area: value.area, description: value.description
  })
}, { immediate: true })

function submit(status: 'Draft' | 'Pending') {
  if (!form.title.trim()) {
    validationMessage.value = 'Property title is required.'
    return
  }
  if (status === 'Pending' && (!form.location.trim() || !form.barangay.trim() ||
    !form.description.trim() || form.price <= 0 || form.area <= 0)) {
    validationMessage.value = 'Complete the location, barangay, description, price, and area before submitting.'
    return
  }
  validationMessage.value = ''
  emit('save', {
    title: form.title.trim(), location: form.location.trim(), barangay: form.barangay.trim(),
    propertyType: form.propertyType, listingType: form.listingType,
    price: Number(form.price) || 0, area: Number(form.area) || 0,
    description: form.description.trim(), status
  })
}
</script>

<template>
  <form class="listing-form" @submit.prevent="submit('Draft')">
    <div class="field full"><label for="broker-title">Property Title *</label><input id="broker-title" v-model="form.title" maxlength="150" placeholder="Enter the property title" /></div>
    <div class="field"><label for="broker-property-type">Property Type</label><select id="broker-property-type" v-model="form.propertyType"><option v-for="type in propertyTypes" :key="type" :value="type">{{ type }}</option></select></div>
    <div class="field"><label for="broker-listing-type">Listing Type</label><select id="broker-listing-type" v-model="form.listingType"><option v-for="type in listingTypes" :key="type" :value="type">{{ type }}</option></select></div>
    <div class="field"><label for="broker-barangay">Barangay</label><input id="broker-barangay" v-model="form.barangay" placeholder="Barangay" /></div>
    <div class="field"><label for="broker-location">Property Location</label><input id="broker-location" v-model="form.location" placeholder="Street / city / nearby landmark" /></div>
    <div class="field"><label for="broker-price">Price (PHP)</label><input id="broker-price" v-model.number="form.price" type="number" min="0" step="0.01" /></div>
    <div class="field"><label for="broker-area">Area (sq. m.)</label><input id="broker-area" v-model.number="form.area" type="number" min="0" step="0.01" /></div>
    <div class="field full"><label for="broker-description">Description</label><textarea id="broker-description" v-model="form.description" rows="6" placeholder="Describe the property" /></div>
    <p v-if="validationMessage" class="validation" role="alert">{{ validationMessage }}</p>
    <div class="actions"><RouterLink class="cancel" to="/broker/listings">Cancel</RouterLink><button type="submit">{{ edit ? 'Save Changes' : 'Save Draft' }}</button><button v-if="!edit" type="button" class="secondary-action" @click="submit('Pending')">Submit for Review</button></div>
    <p class="form-note">Frontend demo: property photos and real administrator review will be added with Laravel.</p>
  </form>
</template>

<style scoped>
.listing-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; padding:26px; background:#fff; border:1px solid #e2e8f0; border-radius:13px; }
.field { display:flex; flex-direction:column; gap:8px; min-width:0; }
.field.full,.actions,.validation,.form-note { grid-column:1/-1; }
label { font-size:12px; font-weight:700; color:#334155; }
input,select,textarea { width:100%; min-height:44px; padding:11px 12px; border:1px solid #cbd5e1; border-radius:8px; color:#142d4e; background:white; font:inherit; font-size:13px; }
textarea { resize:vertical; }
input:focus,select:focus,textarea:focus { outline:2px solid #93c5fd; outline-offset:1px; }
.actions { display:flex; flex-wrap:wrap; align-items:center; justify-content:flex-end; gap:10px; }
.actions button,.cancel { padding:12px 17px; border:1px solid #142d4e; border-radius:8px; color:white; background:#142d4e; font-size:12px; font-weight:700; text-decoration:none; cursor:pointer; }
.actions .secondary-action { background:#2563eb; border-color:#2563eb; }
.cancel { background:white; color:#64748b; border-color:#cbd5e1; }
.validation { margin:0; color:#b91c1c; font-size:12px; }
.form-note { margin:0; color:#94a3b8; font-size:11px; }
@media(max-width:650px){.listing-form{grid-template-columns:1fr;padding:18px;}}
</style>
