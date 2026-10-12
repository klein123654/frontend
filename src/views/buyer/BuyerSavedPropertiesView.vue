<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchSavedProperties, removeSavedProperty } from '@/services/savedPropertyService'
import type { OwnerProperty } from '@/data/owner/ownerProperties'

const properties = ref<OwnerProperty[]>([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    properties.value = await fetchSavedProperties()
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to load saved properties.'
  } finally {
    loading.value = false
  }
}

async function remove(id: number) {
  error.value = ''
  try {
    await removeSavedProperty(id)
    properties.value = properties.value.filter((property) => property.id !== id)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Unable to remove this property.'
  }
}

onMounted(load)
</script>

<template>
  <main class="account-page">
    <header class="page-heading">
      <div><span class="eyebrow">YOUR ACCOUNT</span><h1>Saved Properties</h1><p>Keep track of spaces you want to revisit.</p></div>
      <RouterLink to="/properties" class="primary-button">Explore Properties</RouterLink>
    </header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="loading" role="status" class="empty">Loading your saved properties…</p>
    <section v-else-if="properties.length" class="property-list" aria-label="Saved properties">
      <article v-for="property in properties" :key="property.id" class="property-row">
        <div class="photo"><img v-if="property.images[0]" :src="property.images[0]" :alt="property.title"/><span v-else>No photo</span></div>
        <div class="details"><span class="eyebrow">{{ property.propertyType }} · {{ property.listingType }}</span><h2>{{ property.title }}</h2><p>{{ property.location || 'Location not specified' }}</p></div>
        <div class="actions"><RouterLink :to="`/properties/${property.id}`">View property</RouterLink><button type="button" @click="remove(property.id)">Remove</button></div>
      </article>
    </section>
    <section v-else class="empty"><h2>No saved properties yet</h2><p>Save a property from its detail page and it will appear here.</p><RouterLink to="/properties">Browse properties</RouterLink></section>
  </main>
</template>

<style scoped>
.account-page{max-width:1120px;margin:0 auto;padding:46px 24px 80px;color:#142d4e}.page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:28px}.eyebrow{color:#2563eb;font-size:11px;font-weight:800;letter-spacing:1.2px}.page-heading h1{font-size:32px;margin:8px 0}.page-heading p,.details p,.empty p{color:#64748b;font-size:14px;line-height:1.7;margin:0}.primary-button{background:#142d4e;color:#fff;padding:13px 17px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700}.property-list{display:grid;gap:14px}.property-row{display:flex;align-items:center;gap:20px;padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#fff}.photo{width:145px;height:100px;flex:0 0 auto;border-radius:8px;background:#f1f5f9;display:grid;place-items:center;color:#64748b;font-size:12px;overflow:hidden}.photo img{width:100%;height:100%;object-fit:cover}.details{flex:1;min-width:0}.details h2{font-size:18px;margin:7px 0}.actions{display:flex;align-items:center;gap:14px}.actions a,.empty a{color:#2563eb;font-size:13px;font-weight:700;text-decoration:none}.actions button{border:0;background:none;color:#b91c1c;cursor:pointer;font:inherit;font-size:12px}.empty{text-align:center;padding:55px 20px;border:1px dashed #cbd5e1;border-radius:12px;background:#fff}.empty h2{margin:0 0 10px}.empty p{margin-bottom:15px}.error{padding:12px;background:#fef2f2;color:#991b1b;border-radius:8px}@media(max-width:650px){.page-heading,.property-row{align-items:flex-start;flex-direction:column}.primary-button{width:100%;text-align:center}.photo{width:100%;height:180px}.actions{width:100%;justify-content:space-between}}
</style>
