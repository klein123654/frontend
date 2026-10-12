<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import { RouterLink } from 'vue-router'
import { Inbox, Eye, Search } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { allBrokerInquiries, updateBrokerInquiryStatus, loadBrokerInquiries } from '@/stores/brokerInquiries'
import { allBrokerListings, loadBrokerListings } from '@/stores/brokerListings'
import type { BrokerInquiry, BrokerInquiryStatus } from '@/data/broker/brokerInquiries'

const search = ref('')
const status = ref<BrokerInquiryStatus | null>(null)
const showDetails = ref(false)
const selected = ref<BrokerInquiry | null>(null)
const feedback = ref('')
onMounted(() => Promise.all([loadBrokerInquiries(), loadBrokerListings()]))
const statusOptions: {label:string;value:BrokerInquiryStatus|null}[] = [{label:'All Statuses',value:null},{label:'New',value:'New'},{label:'In Progress',value:'In Progress'},{label:'Closed',value:'Closed'}]
const editOptions = statusOptions.filter((item): item is {label:string;value:BrokerInquiryStatus}=>item.value!==null)
const filtered = computed(() => allBrokerInquiries.value.filter(item =>
  (!status.value || item.status===status.value) &&
  (!search.value.trim() || [item.customerName,item.customerEmail,item.subject,item.message,listingTitle(item.listingId)].some(v=>v.toLowerCase().includes(search.value.trim().toLowerCase())))
))
const current = computed(() => allBrokerInquiries.value.find(item=>item.id===selected.value?.id))
function listingTitle(id:number) { return allBrokerListings.value.find(item=>item.id===id)?.title ?? 'Property unavailable' }
function open(item: BrokerInquiry) { selected.value=item; feedback.value='';showDetails.value=true }
async function setStatus(value: BrokerInquiryStatus) {
  if (!current.value) return
  feedback.value = await updateBrokerInquiryStatus(current.value.id,value) ? 'Status saved.' : 'Could not save status.'
}
function severity(value: BrokerInquiryStatus): 'info'|'warn'|'success' {return value==='New'?'info':value==='In Progress'?'warn':'success'}
</script>
<template><AppSidebar role="broker"><main class="page"><span class="eyebrow">BROKER WORKSPACE</span><h1>Broker Inquiries</h1><p>Review customer inquiries about the properties you represent.</p><div class="notice">Customer messages for your published listings appear here.</div><section class="panel"><div class="panel-heading"><h2>Inquiry Management</h2><span>{{ filtered.length }} inquiries</span></div><div class="filters"><div class="search"><Search :size="17"/><InputText v-model="search" placeholder="Search inquiries..."/></div><Select v-model="status" :options="statusOptions" option-label="label" option-value="value" placeholder="All Statuses" class="filter"/><button type="button" class="reset" @click="search='';status=null">Reset</button></div><DataTable :value="filtered" data-key="id" paginator :rows="5" sort-field="dateReceived" :sort-order="-1" table-style="min-width:750px" class="inquiry-table"><Column field="customerName" header="Customer" sortable/><Column field="subject" header="Subject" sortable/><Column header="Property"><template #body="{data}"><RouterLink :to="`/broker/listings/${data.listingId}`">{{ listingTitle(data.listingId) }}</RouterLink></template></Column><Column field="dateReceived" header="Received" sortable/><Column field="status" header="Status"><template #body="{data}"><Tag :value="data.status" :severity="severity(data.status)" rounded/></template></Column><Column header="Actions"><template #body="{data}"><button class="view" type="button" @click="open(data)"><Eye :size="16"/> View</button></template></Column><template #empty><div class="empty"><Inbox :size="37"/><h3>No Inquiries Yet</h3><p>No customer inquiries have been received.</p></div></template></DataTable></section><Dialog v-model:visible="showDetails" modal header="Inquiry Details" :style="{width:'min(550px,95vw)'}"><div v-if="current" class="details"><p><strong>Customer:</strong> {{ current.customerName }}</p><p><strong>Email:</strong> {{ current.customerEmail }}</p><p><strong>Property:</strong> {{ listingTitle(current.listingId) }}</p><p><strong>Subject:</strong> {{ current.subject }}</p><div class="message">{{ current.message }}</div><label for="broker-inquiry-status">Inquiry Status</label><Select id="broker-inquiry-status" :model-value="current.status" :options="editOptions" option-label="label" option-value="value" class="status-select" @update:model-value="(value)=>setStatus(value as BrokerInquiryStatus)"/><p role="status">{{ feedback }}</p></div></Dialog></main></AppSidebar></template>
<style scoped>.page{max-width:1350px;margin:auto}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.3px}h1{color:#142d4e;font-size:32px;margin:10px 0}h2{color:#142d4e;font-size:19px;margin:0}p{font-size:12px;color:#64748b;line-height:1.7}.notice{border:1px solid #dbeafe;background:#eff6ff;color:#47617f;padding:16px 18px;border-radius:10px;margin:22px 0}.panel{padding:26px;background:white;border:1px solid #e2e8f0;border-radius:13px}.panel-heading{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:23px}.panel-heading>span{font-size:12px;color:#64748b}.filters{display:flex;gap:12px;margin-bottom:22px}.search{flex:1;position:relative;min-width:0}.search>svg{position:absolute;top:13px;left:13px;color:#94a3b8;z-index:1}.search input{padding-left:40px;width:100%}.filter{width:175px}.reset{border:1px solid #e2e8f0;background:white;border-radius:8px;padding:12px;color:#64748b}.inquiry-table :deep(.p-datatable-table-container){overflow:auto}.inquiry-table :deep(td){font-size:12px}.view{display:inline-flex;gap:7px;align-items:center;border:1px solid #dbeafe;background:#eff6ff;color:#2563eb;border-radius:8px;padding:9px 12px;cursor:pointer}.empty{text-align:center;padding:50px 14px;color:#94a3b8;display:flex;flex-direction:column;align-items:center;gap:12px}.empty h3{color:#142d4e;margin:0}.details{display:flex;flex-direction:column;gap:10px}.details p{margin:0}.message{padding:15px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;font-size:13px;color:#334155}.details label{font-size:12px;color:#64748b}.status-select{width:100%}@media(max-width:650px){.panel{padding:16px}.filters{flex-wrap:wrap}.search{flex-basis:100%}.filter{flex:1}}
</style>
