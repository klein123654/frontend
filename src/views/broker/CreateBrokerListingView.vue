<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import BrokerListingForm from '@/components/forms/BrokerListingForm.vue'
import SaveResultDialog from '@/components/common/SaveResultDialog.vue'
import { addBrokerListing } from '@/stores/brokerListings'
import type { BrokerListingInput } from '@/data/broker/brokerListings'
import { clearFormDraft } from '@/composables/useFormDraft'
import { useBrokerVerification } from '@/composables/useBrokerVerification'
import { useListingSaveDialog } from '@/composables/useListingSaveDialog'

const route = useRoute()
const { canManageListings, verificationLoading, blockedMessage } = useBrokerVerification()
const { dialog, busy, formKey, primaryLabel, submit, primary, close } = useListingSaveDialog<BrokerListingInput>({
  mode: 'create',
  listPath: '/broker/listings',
  save: (input) => addBrokerListing(input),
  afterSave: () => clearFormDraft(`broker-listing-${route.fullPath}`),
})
</script>
<template><AppSidebar role="broker"><main class="page"><RouterLink class="back" to="/broker/listings">← Back to My Listings</RouterLink><span class="eyebrow">BROKER WORKSPACE</span><h1>Add New Listing</h1><p>Create a draft or submit a property for administrator review.</p><div v-if="!verificationLoading && !canManageListings" class="warning" role="status">{{ blockedMessage }}</div><BrokerListingForm v-else-if="canManageListings" :key="formKey" @save="submit"/><SaveResultDialog :open="dialog.open" :variant="dialog.variant" :title="dialog.title" :message="dialog.message" :note="dialog.note" :primary-label="primaryLabel" link-label="View my listings" link-to="/broker/listings" :busy="busy" @primary="primary" @close="close"/></main></AppSidebar></template>
<style scoped>.page{max-width:1080px;margin:auto}.back{display:block;margin-bottom:26px;color:#5e6d82;text-decoration:none;font-size:12px}.eyebrow{color:#2563eb;font-size:11px;letter-spacing:1.3px;font-weight:800}h1{color:#142d4e;margin:12px 0}p{font-size:13px;color:#5e6d82;margin:0 0 23px}.warning{background:#fffbeb;color:#92400e;border:1px solid #fde68a;padding:13px;margin-bottom:20px;border-radius:8px;font-size:12px}</style>
