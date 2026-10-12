<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BrokerListingForm from '@/components/forms/BrokerListingForm.vue'
import { addBrokerListing } from '@/stores/brokerListings'
import type { BrokerListingInput } from '@/data/broker/brokerListings'
import { clearFormDraft } from '@/composables/useFormDraft'
import { useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const message = ref('')
async function save(input: BrokerListingInput) {
  try {
    const listing = await addBrokerListing(input)
    clearFormDraft(`broker-listing-${route.fullPath}`)
    void router.push(`/broker/listings/${listing.id}`)
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Unable to save this listing.'
  }
}
</script>
<template><AppSidebar role="broker"><main class="page"><RouterLink class="back" to="/broker/listings">← Back to My Listings</RouterLink><span class="eyebrow">BROKER WORKSPACE</span><h1>Add New Listing</h1><p>Create a draft or submit a property for administrator review.</p><div v-if="message" class="warning" role="alert">{{ message }}</div><BrokerListingForm @save="save"/></main></AppSidebar></template>
<style scoped>.page{max-width:1080px;margin:auto}.back{display:block;margin-bottom:26px;color:#64748b;text-decoration:none;font-size:12px}.eyebrow{color:#2563eb;font-size:11px;letter-spacing:1.3px;font-weight:800}h1{color:#142d4e;margin:12px 0}p{font-size:13px;color:#64748b;margin:0 0 23px}.warning{background:#fffbeb;color:#92400e;border:1px solid #fde68a;padding:13px;margin-bottom:20px;border-radius:8px;font-size:12px}</style>
