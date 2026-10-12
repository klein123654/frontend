<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BrokerListingForm from '@/components/forms/BrokerListingForm.vue'
import { getEditableBrokerListing, updateBrokerListing, loadBrokerListings } from '@/stores/brokerListings'
import type { BrokerListingInput } from '@/data/broker/brokerListings'
import { clearFormDraft } from '@/composables/useFormDraft'
const route = useRoute()
const router = useRouter()
const id = computed(() => Number(route.params.id))
const listing = computed(() => getEditableBrokerListing(id.value))
const warning = ref('')
onMounted(() => loadBrokerListings().catch((error) => { warning.value = error instanceof Error ? error.message : 'Unable to load listings.' }))
async function save(input: BrokerListingInput) {
  if (!listing.value) return
  const saved = await updateBrokerListing(id.value, input)
  if (saved) {
    clearFormDraft(`broker-listing-${route.fullPath}`)
    void router.push(`/broker/listings/${id.value}`)
  }
  else warning.value = 'Unable to update the listing. Check your permissions and try again.'
}
</script>
<template><AppSidebar role="broker"><main class="page"><RouterLink class="back" to="/broker/listings">← Back to My Listings</RouterLink><template v-if="listing"><span class="eyebrow">BROKER WORKSPACE</span><h1>Edit Listing</h1><p>Update this draft or rejected listing and submit it for review.</p><div v-if="warning" class="warning" role="alert">{{ warning }}</div><BrokerListingForm edit :initial="listing" @save="save"/></template><div v-else class="unavailable"><h1>Listing Cannot Be Edited</h1><p>This listing does not exist or is not editable.</p><RouterLink to="/broker/listings">Return to My Listings</RouterLink></div></main></AppSidebar></template>
<style scoped>.page{max-width:1080px;margin:auto}.back{display:block;margin-bottom:26px;color:#64748b;text-decoration:none;font-size:12px}.eyebrow{color:#2563eb;font-size:11px;letter-spacing:1.3px;font-weight:800}h1{color:#142d4e;margin:12px 0}p{font-size:13px;color:#64748b;margin:0 0 23px}.unavailable{background:white;padding:35px;border:1px solid #e2e8f0;border-radius:12px}.unavailable a{color:#2563eb}.warning{background:#fffbeb;color:#92400e;border:1px solid #fde68a;padding:13px;margin-bottom:20px;border-radius:8px;font-size:12px}</style>
