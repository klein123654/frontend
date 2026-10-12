
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { publicCatalogue } from '@/stores/publicCatalogue'
import PropertyGallery from '@/components/property/PropertyGallery.vue'
import InquiryForm from '@/components/forms/InquiryForm.vue'

const route = useRoute()

const property = computed(() =>
  publicCatalogue.value.find((item) => item.id === Number(route.params.id))
)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(price)
</script>

<template>
  <main class="container">
    <RouterLink to="/properties" class="back">
      ← Back to Properties
    </RouterLink>

    <template v-if="property">
      <!-- PROPERTY HEADING -->
      <div class="heading">
        <div>
          <span class="category">{{ property.type }}</span>
          <h1>{{ property.title }}</h1>
          <p class="location">{{ property.location }}</p>
          <span class="listing-badge">{{ property.listingType }}</span>
        </div>

        <div class="price">
          {{ formatPrice(property.price) }}
          <small v-if="property.listingType === 'For Rent'">
            / month
          </small>
        </div>
      </div>

      <!-- INTERACTIVE IMAGE GALLERY -->
      <PropertyGallery
        :key="property.id"
        :images="property.images"
        :title="property.title"
      />

      <!-- MAIN CONTENT -->
      <div class="content">
        <div class="main-details">

          <!-- PROPERTY OVERVIEW -->
          <section class="panel">
            <h2>Property Overview</h2>

            <div class="specifications">
              <div>
                <span>Property Type</span>
                <strong>{{ property.type }}</strong>
              </div>

              <div>
                <span>Listing Type</span>
                <strong>{{ property.listingType }}</strong>
              </div>

              <div>
                <span>Floor / Lot Area</span>
                <strong>{{ property.area }} sqm</strong>
              </div>

              <div>
                <span>Barangay</span>
                <strong>{{ property.barangay }}</strong>
              </div>
            </div>
          </section>

          <!-- DESCRIPTION -->
          <section class="panel">
            <h2>About This Property</h2>
            <p>{{ property.description }}</p>
          </section>

          <!-- LOCATION -->
          <section class="panel">
            <h2>Property Location</h2>

            <div class="location-info">
              <strong>{{ property.location }}</strong>
              <p>
                Butuan City, Agusan del Norte, Philippines
              </p>
            </div>

            <div class="map-placeholder">
              <span>Location Map</span>
              <p>
                Interactive property maps will be
                available in a future update.
              </p>
            </div>
          </section>

          <!-- DISCLAIMER -->
          <div class="disclaimer">
            Demonstration environment: sample listings may contain fictional details.
            Browser-created listings and inquiries are not synchronized to a real server.
          </div>

        </div>

        <!-- INQUIRY SIDEBAR -->
        <aside class="inquiry-sidebar">
          <div class="inquiry-panel">
            <InquiryForm
              :key="property.id"
              :property-id="property.id"
              :property-title="property.title"
              :contact-name="property.contactName"
              :contact-role="property.contactRole"
            />
          </div>
        </aside>
      </div>
    </template>

    <!-- PROPERTY NOT FOUND -->
    <section v-else class="not-found">
      <h1>Property Not Found</h1>
      <p>
        The property you're looking for does not exist
        or is unavailable.
      </p>

      <RouterLink to="/properties" class="browse-button">
        Browse Properties
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 45px 24px 90px;
}

/* BACK LINK */

.back {
  display: inline-block;
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.back:hover {
  text-decoration: underline;
}

/* PROPERTY HEADING */

.heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  margin: 35px 0 28px;
}

.category {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

.heading h1 {
  font-size: clamp(29px, 4vw, 40px);
  color: #142d4e;
  letter-spacing: -1px;
  margin: 12px 0;
}

.location {
  color: #64748b;
  font-size: 14px;
}

.listing-badge {
  display: inline-block;
  margin-top: 10px;
  padding: 7px 12px;
  background: #eaf1fc;
  color: #2563eb;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
}

.price {
  color: #142d4e;
  font-size: 29px;
  font-weight: 800;
  white-space: nowrap;
}

.price small {
  color: #64748b;
  font-size: 13px;
  font-weight: 400;
}

/* CONTENT LAYOUT */

.content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(300px, 1fr);
  gap: 28px;
  margin-top: 35px;
  align-items: start;
}

.main-details {
  display: grid;
  gap: 22px;
}

/* PANELS */

.panel,
.inquiry-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 28px;
}

.panel h2 {
  color: #142d4e;
  font-size: 20px;
  margin: 0 0 25px;
}

.panel p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.8;
}

/* PROPERTY SPECIFICATIONS */

.specifications {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.specifications div {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.specifications span {
  color: #64748b;
  font-size: 13px;
}

.specifications strong {
  color: #142d4e;
  font-size: 15px;
}

/* LOCATION */

.location-info strong {
  color: #142d4e;
  font-size: 14px;
}

.location-info p {
  margin-top: 7px;
}

.map-placeholder {
  background: #f3f6fb;
  border: 1px dashed #cbd5e1;
  min-height: 180px;
  border-radius: 10px;
  margin-top: 20px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.map-placeholder span {
  color: #142d4e;
  font-size: 15px;
  font-weight: 700;
}

.map-placeholder p {
  max-width: 250px;
  margin-bottom: 0;
  font-size: 12px;
}

/* INQUIRY SIDEBAR */

.inquiry-sidebar {
  min-width: 0;
}

.inquiry-panel {
  position: sticky;
  top: 105px;
}

/* DISCLAIMER */

.disclaimer {
  padding: 18px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

/* NOT FOUND */

.not-found {
  text-align: center;
  padding: 110px 0;
}

.not-found h1 {
  color: #142d4e;
}

.not-found p {
  color: #64748b;
  line-height: 1.7;
}

.browse-button {
  display: inline-block;
  margin-top: 20px;
  padding: 14px 24px;
  border-radius: 9px;
  background: #142d4e;
  color: white;
  text-decoration: none;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .content {
    grid-template-columns: 1fr;
  }

  .inquiry-panel {
    position: static;
  }
}

@media (max-width: 600px) {
  .heading {
    flex-direction: column;
    align-items: start;
  }

  .price {
    font-size: 25px;
  }

  .specifications {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .panel,
  .inquiry-panel {
    padding: 20px;
  }
}
</style>
