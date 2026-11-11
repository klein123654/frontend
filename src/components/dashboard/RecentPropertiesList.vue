<script setup lang="ts">
import { Building2 } from '@lucide/vue'
import { formatOwnerPrice as formatPrice, type OwnerProperty } from '@/data/owner/ownerProperties'

defineProps<{
  properties: OwnerProperty[]
}>()
</script>

<template>
  <div class="property-list">
    <article v-for="property in properties" :key="property.id" class="property-row">
      <img
        v-if="property.images.length > 0 && property.images[0]"
        loading="lazy"
        decoding="async"
        :src="property.images[0]"
        :alt="property.title"
        class="property-image"
      />
      <div v-else class="property-image-placeholder" role="img" aria-label="Property image unavailable">
        <Building2 :size="26" />
      </div>

      <div class="property-info">
        <h3>{{ property.title }}</h3>
        <p>{{ property.location || 'Location not specified' }}</p>

        <strong v-if="property.price > 0">
          {{ formatPrice(property.price) }}
          <span v-if="property.listingType === 'For Rent'">/ month</span>
        </strong>
        <strong v-else class="price-unavailable">Price not specified</strong>
      </div>

      <span class="status-badge" :class="property.status.toLowerCase()">
        {{ property.status }}
      </span>
    </article>

    <div v-if="properties.length === 0" class="empty-properties">
      No properties available yet.
    </div>
  </div>
</template>

<style scoped>
.property-list {
  display: flex;
  flex-direction: column;
}

.property-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 17px 0;
  border-top: 1px solid #e2e8f0;
}

.property-image,
.property-image-placeholder {
  width: 90px;
  height: 72px;
  border-radius: 9px;
  flex-shrink: 0;
}

.property-image {
  object-fit: cover;
  background: #f1f5f9;
}

.property-image-placeholder {
  display: grid;
  place-items: center;
  border: 1px solid #dbeafe;
  background: #eaf1fc;
  color: #2563eb;
}

.property-info {
  flex: 1;
  min-width: 0;
}

.property-info h3 {
  color: #142d4e;
  font-size: 13px;
  margin: 0 0 7px;
  overflow-wrap: anywhere;
}

.property-info p {
  color: #5e6d82;
  font-size: 11px;
  margin: 0 0 9px;
  overflow-wrap: anywhere;
}

.property-info strong {
  color: #142d4e;
  font-size: 13px;
}

.property-info strong span {
  color: #5e6d82;
  font-size: 11px;
  font-weight: 400;
}

.property-info .price-unavailable {
  color: #5e6d82;
  font-weight: 500;
}

.status-badge {
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.status-badge.approved {
  color: #15803d;
  background: #dcfce7;
}

.status-badge.pending {
  color: #a16207;
  background: #fef9c3;
}

.status-badge.draft {
  color: #475569;
  background: #f1f5f9;
}

.status-badge.rejected {
  color: #b91c1c;
  background: #fee2e2;
}

.empty-properties {
  padding: 20px 0;
  color: #5e6d82;
  font-size: 12px;
  text-align: center;
}

@media (max-width: 600px) {
  .property-row {
    flex-wrap: wrap;
  }

  .property-image,
  .property-image-placeholder {
    width: 76px;
    height: 65px;
  }

  .status-badge {
    margin-left: 92px;
  }
}
</style>
