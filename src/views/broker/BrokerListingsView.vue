<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import { Building2, Plus, Eye, Pencil, Search, Trash2 } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { allBrokerListings, getEditableBrokerListing, loadBrokerListings, deleteBrokerListing } from '@/stores/brokerListings'
import { formatBrokerPrice, type BrokerListingStatus } from '@/data/broker/brokerListings'

const search = ref('')
const statusFilter = ref<BrokerListingStatus | null>(null)
const statuses = [{label:'All Statuses',value:null},{label:'Approved',value:'Approved'},{label:'Pending',value:'Pending'},{label:'Draft',value:'Draft'},{label:'Rejected',value:'Rejected'}]
const message = ref('')
onMounted(() => loadBrokerListings().catch((error) => { message.value = error instanceof Error ? error.message : 'Unable to load listings.' }))
async function remove(id: number, title: string) {
  if (!getEditableBrokerListing(id) || !window.confirm(`Delete "${title}"? This cannot be undone.`)) return
  const removed = await deleteBrokerListing(id)
  message.value = removed ? 'Listing deleted.' : 'Unable to delete this listing.'
}
const filtered = computed(() => allBrokerListings.value.filter(item =>
  (!statusFilter.value || item.status === statusFilter.value) &&
  (!search.value.trim() || [item.title,item.location,item.barangay,item.propertyType].some(v=>v.toLowerCase().includes(search.value.trim().toLowerCase())))
))
function severity(status: BrokerListingStatus): 'success'|'warn'|'danger'|'secondary' {
  return status==='Approved'?'success':status==='Pending'?'warn':status==='Rejected'?'danger':'secondary'
}
</script>
<template>
  <AppSidebar role="broker"><main class="page"><header class="heading"><div><span class="eyebrow">BROKER WORKSPACE</span><h1>My Listings</h1><p>Organize and manage your commercial property listings.</p></div><RouterLink to="/broker/listings/create" class="button"><Plus :size="18"/> Add Listing</RouterLink></header>
    <div class="notice">Listings are stored in your account. Broker verification is required before submitting listings for review.</div><p v-if="message" role="status">{{ message }}</p>
    <section class="panel"><div class="panel-heading"><div><h2>Property Listings</h2><p>{{ filtered.length }} listings</p></div></div><div class="filters"><div class="search"><Search :size="17"/><InputText v-model="search" placeholder="Search listings..." aria-label="Search listings"/></div><Select v-model="statusFilter" :options="statuses" option-label="label" option-value="value" placeholder="All Statuses" class="filter"/><button class="reset" type="button" @click="search='';statusFilter=null">Reset</button></div>
    <DataTable :value="filtered" data-key="id" paginator :rows="5" :rows-per-page-options="[5,10,20]" striped-rows sort-field="dateCreated" :sort-order="-1" table-style="min-width:780px" class="listing-table">
      <Column field="title" header="Listing" sortable><template #body="{data}"><div class="property"><span class="thumbnail"><img v-if="data.images[0]" :src="data.images[0]" :alt="data.title"/><Building2 v-else :size="23"/></span><span><strong>{{ data.title }}</strong><small>{{ data.location || 'Location not specified' }}</small></span></div></template></Column>
      <Column field="listingType" header="Listing Type" sortable/>
      <Column field="price" header="Price" sortable><template #body="{data}">{{ data.price>0?formatBrokerPrice(data.price):'Not specified' }}</template></Column>
      <Column field="status" header="Status" sortable><template #body="{data}"><Tag :value="data.status" :severity="severity(data.status)" rounded/></template></Column>
      <Column field="dateCreated" header="Created" sortable/>
      <Column header="Actions"><template #body="{data}"><div class="actions"><RouterLink :to="`/broker/listings/${data.id}`" :title="`View ${data.title}`" :aria-label="`View ${data.title}`"><Eye :size="17"/></RouterLink><RouterLink v-if="getEditableBrokerListing(data.id)" :to="`/broker/listings/${data.id}/edit`" :aria-label="`Edit ${data.title}`" :title="`Edit ${data.title}`"><Pencil :size="17"/></RouterLink><button v-else disabled type="button" title="Only drafts or rejected listings can be edited"><Pencil :size="17"/></button><button v-if="getEditableBrokerListing(data.id)" type="button" :aria-label="`Delete ${data.title}`" :title="`Delete ${data.title}`" class="delete" @click="remove(data.id,data.title)"><Trash2 :size="17"/></button></div></template></Column>
      <template #empty><div class="empty"><Building2 :size="34"/><h3>No listings found</h3><p>Create your first listing or change the filters.</p><RouterLink to="/broker/listings/create" class="button"><Plus :size="16"/> Create Listing</RouterLink></div></template>
    </DataTable></section>
  </main></AppSidebar>
</template>
<style scoped>
.page{max-width:1350px;margin:auto;min-width:0}.heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:25px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.3px}h1{color:#142d4e;font-size:clamp(26px,3vw,34px);margin:10px 0}h2{font-size:20px;color:#142d4e;margin:0 0 8px}p{font-size:12px;color:#64748b;line-height:1.7;margin:0}.button{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#142d4e;color:white;padding:12px 17px;border-radius:9px;text-decoration:none;font-size:12px;font-weight:700;white-space:nowrap}.button:hover{background:#2563eb}.notice{padding:16px 18px;margin-bottom:24px;color:#47617f;background:#eff6ff;border:1px solid #dbeafe;border-radius:10px;font-size:12px;line-height:1.7}.panel{background:white;border:1px solid #e2e8f0;padding:26px;border-radius:13px;min-width:0}.panel-heading{margin-bottom:23px}.filters{display:flex;gap:13px;margin-bottom:22px;align-items:center}.search{position:relative;flex:1;min-width:0}.search svg{position:absolute;top:13px;left:13px;color:#94a3b8;z-index:1}.search input{width:100%;padding-left:39px}.filter{width:180px}.reset{border:1px solid #e2e8f0;border-radius:8px;background:white;padding:12px 17px;color:#64748b;cursor:pointer}.listing-table :deep(.p-datatable-table-container){overflow-x:auto}.listing-table :deep(th){background:#f8fafc;color:#64748b;font-size:12px}.listing-table :deep(td){font-size:12px;color:#334155}.property{display:flex;align-items:center;gap:13px;min-width:200px}.property>span:last-child{display:flex;flex-direction:column;gap:6px}.property strong{color:#142d4e}.property small{color:#94a3b8}.thumbnail{display:grid;place-items:center;background:#eaf1fc;color:#2563eb;width:73px;height:60px;flex-shrink:0;border-radius:8px;overflow:hidden}.thumbnail img{height:100%;width:100%;object-fit:cover}.actions{display:flex;gap:8px}.actions a,.actions button{display:grid;place-items:center;width:35px;height:35px;border:1px solid #e2e8f0;border-radius:8px;background:white;color:#2563eb;cursor:pointer;text-decoration:none}.actions button:disabled{opacity:.4;cursor:not-allowed}.empty{display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:42px 12px;color:#94a3b8}.empty h3{margin:0;color:#142d4e}@media(max-width:680px){.heading{flex-direction:column;align-items:flex-start}.button{width:100%}.filters{flex-wrap:wrap}.search{flex-basis:100%}.filter{flex:1}.panel{padding:16px}}
 .actions .delete{color:#b91c1c}
</style>
