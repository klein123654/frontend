
<script setup lang="ts">
import { computed } from 'vue'
import AvailabilityBadge from '@/components/common/AvailabilityBadge.vue'
import VerifiedBadge from '@/components/publisher/VerifiedBadge.vue'
import { acceptsInquiries } from '@/utils/availability'
import { formatPeso, formatPricePerSqm } from '@/utils/format'
import type { Property } from '@/types/property'

const props = defineProps<{
  property: Property
}>()

const formatPrice = formatPeso
const unavailable = computed(() => !acceptsInquiries(props.property.availability))

/** "Broker: Maria Santos · Agusan Prime Realty" or "Listed directly by the owner". */
const listedBy = computed(() => {
  const publisher = props.property.publisher
  if (!publisher) return ''
  if (publisher.role === 'broker') {
    const firm = publisher.broker?.firm?.name
    return `Broker: ${publisher.name}${firm ? ` · ${firm}` : ''}`
  }
  return 'Listed directly by the owner'
})
</script>

<template>
  <RouterLink :to="`/properties/${property.id}`" class="property-card" :class="{ 'property-card--unavailable': unavailable }">
    <div class="image-wrapper">
      <img loading="lazy" decoding="async" v-if="property.images[0]" :src="property.images[0]" :alt="property.title" />
      <div v-else class="no-image" role="img" :aria-label="`No photo available for ${property.title}`">No Photo Available</div>
      <span class="status">{{ property.listingType }}</span>
      <AvailabilityBadge class="availability" :availability="property.availability" />
    </div>

    <div class="details">
      <span class="type">{{ property.type }}</span>
      <h3>{{ property.title }}</h3>
      <p class="location">📍 {{ property.location }}</p>
      <p v-if="listedBy" class="listed-by" data-testid="card-listed-by">{{ listedBy }}</p>

      <div class="meta">
        <span>{{ property.area }} sqm</span>
        <VerifiedBadge v-if="property.publisher?.verified" :publisher="property.publisher" compact />
        <span v-else>{{ property.contactRole }} Listed</span>
      </div>

      <div class="bottom">
        <div>
          <strong>{{ formatPrice(property.price) }}</strong>
          <small v-if="property.listingType === 'For Rent'"> / month</small>
          <span v-if="formatPricePerSqm(property.price, property.area)" class="per-sqm">{{ formatPricePerSqm(property.price, property.area) }}</span>
        </div>
        <span class="view">{{ unavailable ? 'See details' : 'View Details →' }}</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.per-sqm {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

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
.no-image { height: 100%; display: grid; place-items: center; background: #f1f5f9; color: #5e6d82; font-size: 13px; }
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

.availability {
  position: absolute;
  top: 15px;
  right: 15px;
  box-shadow: 0 2px 8px #0f172a26;
}

.property-card--unavailable .image-wrapper img { filter: grayscale(.65); opacity: .8; }
.listed-by {
  margin: 8px 0 0;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details { padding: 22px; }
.type { color: #2563eb; font-size: 12px; font-weight: 700; }
h3 { font-size: 19px; margin: 10px 0; }
.location { color: #5e6d82; font-size: 13px; }
.meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 0;
  color: #5e6d82;
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
small { color: #5e6d82; }
.view { color: #2563eb; font-size: 12px; font-weight: 600; }
</style>
