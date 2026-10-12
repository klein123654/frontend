
<script setup lang="ts">
import type { Property } from '@/types/property'

defineProps<{
  property: Property
}>()

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(price)
</script>

<template>
  <RouterLink :to="`/properties/${property.id}`" class="property-card">
    <div class="image-wrapper">
      <img v-if="property.images[0]" :src="property.images[0]" :alt="property.title" />
      <div v-else class="no-image" role="img" :aria-label="`No photo available for ${property.title}`">No Photo Available</div>
      <span class="status">{{ property.listingType }}</span>
    </div>

    <div class="details">
      <span class="type">{{ property.type }}</span>
      <h3>{{ property.title }}</h3>
      <p class="location">📍 {{ property.location }}</p>

      <div class="meta">
        <span>{{ property.area }} sqm</span>
        <span>{{ property.contactRole }} Listed</span>
      </div>

      <div class="bottom">
        <div>
          <strong>{{ formatPrice(property.price) }}</strong>
          <small v-if="property.listingType === 'For Rent'"> / month</small>
        </div>
        <span class="view">View Details →</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.property-card {
  display: block;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  text-decoration: none;
  color: #142d4e;
  transition: transform .2s, box-shadow .2s;
}

.property-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 35px #142d4e12;
}

.image-wrapper { height: 220px; position: relative; }
.no-image { height: 100%; display: grid; place-items: center; background: #f1f5f9; color: #64748b; font-size: 13px; }
.image-wrapper img { width: 100%; height: 100%; object-fit: cover; }

.status {
  position: absolute;
  top: 15px;
  left: 15px;
  background: white;
  padding: 8px 13px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
}

.details { padding: 22px; }
.type { color: #2563eb; font-size: 12px; font-weight: 700; }
h3 { font-size: 19px; margin: 10px 0; }
.location { color: #64748b; font-size: 13px; }
.meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 0;
  color: #64748b;
  font-size: 12px;
}
.bottom {
  border-top: 1px solid #edf0f5;
  padding-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
strong { font-size: 19px; }
small { color: #64748b; }
.view { color: #2563eb; font-size: 12px; font-weight: 600; }
</style>
