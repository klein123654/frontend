
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import {
  ArrowLeft,
  Building2,
  MapPin,
  PhilippinePeso,
  Ruler,
  CalendarDays,
  FileText,
  MessageSquare,
  Pencil,
  Info,
  ImageOff,
  Clock3,
  CheckCircle2,
  FilePenLine,
  XCircle
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'

import {
  formatOwnerPrice,
  type OwnerListingStatus
} from '@/data/owner/ownerProperties'

import {
  allOwnerProperties,
  getEditableOwnerProperty,
  loadOwnerProperties
} from '@/stores/ownerProperties'
onMounted(() => loadOwnerProperties())

// CURRENT PROPERTY ID
const route = useRoute()
const workspaceBase = usePublisherBasePath()

const propertyId = computed(() => {
  const rawId = route.params.id
  const id = Number(rawId)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
})

// GET PROPERTY FROM SHARED STORE
const property = computed(() =>
  allOwnerProperties.value.find(
    (item) => item.id === propertyId.value
  )
)

// CHECK IF PROPERTY CAN BE EDITED
const canEdit = computed(() =>
  property.value !== undefined &&
  getEditableOwnerProperty(property.value.id) !== undefined
)

// STATUS DESCRIPTION
const statusMessage = computed(() => {
  switch (property.value?.status) {
    case 'Approved':
      return 'This listing is approved and visible to the public.'
    case 'Pending':
      return 'This listing is waiting for administrator review.'
    case 'Rejected':
      return 'This listing was rejected. Review the administrator note before resubmitting.'
    case 'Draft':
      return 'This listing is a draft and can be edited.'
    default:
      return ''
  }
})

// STATUS ICON
function getStatusIcon(status: OwnerListingStatus) {
  switch (status) {
    case 'Approved':
      return CheckCircle2
    case 'Pending':
      return Clock3
    case 'Rejected':
      return XCircle
    default:
      return FilePenLine
  }
}

// IMAGE FALLBACK
const imageFailed = ref(false)

const primaryImage = computed(
  () => property.value?.images[0] ?? ''
)

function handleImageError() {
  imageFailed.value = true
}
</script>

<template>
  <AppSidebar role="owner">
    <main class="details-page">

      <!-- BACK LINK -->
      <RouterLink
        :to="`${workspaceBase}/properties`"
        class="back-link"
      >
        <ArrowLeft :size="17" />
        Back to My Properties
      </RouterLink>

      <!-- PROPERTY FOUND -->
      <template v-if="property">

        <!-- HEADER -->
        <header class="page-header">
          <div class="heading-content">
            <span class="eyebrow">
              PUBLISHER WORKSPACE
            </span>

            <h1>Property Details</h1>

            <p>
              Review your property's information and
              current listing status.
            </p>
          </div>

          <RouterLink
            v-if="canEdit"
            :to="`${workspaceBase}/properties/${property.id}/edit`"
            class="edit-button"
          >
            <Pencil :size="17" />
            Edit Property
          </RouterLink>
        </header>

        <!-- STATUS PANEL -->
        <section class="status-panel">
          <div
            class="status-icon"
            :class="property.status.toLowerCase()"
          >
            <component
              :is="getStatusIcon(property.status)"
              :size="22"
            />
          </div>

          <div class="status-content">
            <div class="status-heading">
              <strong>Listing Status</strong>

              <span
                class="status-badge"
                :class="property.status.toLowerCase()"
              >
                {{ property.status }}
              </span>
            </div>

            <p>{{ statusMessage }}</p>
            <p v-if="property.reviewNotes"><strong>Administrator note:</strong> {{ property.reviewNotes }}</p>
          </div>
        </section>

        <div class="content-grid">

          <!-- MAIN PROPERTY INFORMATION -->
          <div class="main-column">

            <!-- IMAGE -->
            <section class="details-card image-card">
              <div class="property-image-container">
                <img
                  v-if="primaryImage && !imageFailed"
                  :src="primaryImage"
                  :alt="property.title"
                  class="property-image"
                  @error="handleImageError"
                />

                <div
                  v-else
                  class="image-placeholder"
                  role="img"
                  aria-label="Property image unavailable"
                >
                  <ImageOff :size="34" />

                  <strong>No Photo Available</strong>

                  <p>
                    Property photos will be managed
                    through the Laravel backend.
                  </p>
                </div>
              </div>
            </section>

            <!-- BASIC DETAILS -->
            <section class="details-card">
              <div class="card-heading">
                <Building2 :size="19" />
                <h2>Property Information</h2>
              </div>

              <h3 class="property-title">
                {{ property.title }}
              </h3>

              <div class="location-line">
                <MapPin :size="16" />

                <span>
                  {{
                    property.location ||
                    'Location not specified'
                  }}
                </span>
              </div>

              <div class="detail-grid">

                <div class="detail-item">
                  <span>Property Type</span>
                  <strong>
                    {{ property.propertyType }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>Listing Type</span>
                  <strong>
                    {{ property.listingType }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>Barangay</span>
                  <strong>
                    {{
                      property.barangay ||
                      'Not specified'
                    }}
                  </strong>
                </div>

                <div class="detail-item">
                  <span>Property ID</span>
                  <strong>
                    #{{ property.id }}
                  </strong>
                </div>

              </div>
            </section>

            <!-- DESCRIPTION -->
            <section class="details-card">
              <div class="card-heading">
                <FileText :size="19" />
                <h2>Property Description</h2>
              </div>

              <p class="description">
                {{
                  property.description ||
                  'No property description has been provided.'
                }}
              </p>
            </section>

          </div>

          <!-- SIDEBAR INFORMATION -->
          <aside class="side-column">

            <!-- PRICE AND AREA -->
            <section class="details-card">
              <div class="card-heading">
                <PhilippinePeso :size="19" />
                <h2>Pricing & Area</h2>
              </div>

              <div class="price-section">
                <span>
                  {{
                    property.listingType === 'For Rent'
                      ? 'Monthly Rental Price'
                      : 'Selling Price'
                  }}
                </span>

                <strong v-if="property.price > 0">
                  {{ formatOwnerPrice(property.price) }}
                </strong>

                <strong v-else class="not-specified">
                  Not specified
                </strong>
              </div>

              <div class="area-section">
                <Ruler :size="19" />

                <div>
                  <span>Property Area</span>

                  <strong>
                    {{
                      property.area > 0
                        ? `${property.area.toLocaleString('en-PH')} sq. m.`
                        : 'Not specified'
                    }}
                  </strong>
                </div>
              </div>
            </section>

            <!-- LISTING ACTIVITY -->
            <section class="details-card">
              <div class="card-heading">
                <CalendarDays :size="19" />
                <h2>Listing Activity</h2>
              </div>

              <div class="activity-row">
                <CalendarDays :size="18" />

                <div>
                  <span>Date Created</span>
                  <strong>
                    {{ property.dateCreated }}
                  </strong>
                </div>
              </div>

              <div class="activity-row">
                <MessageSquare :size="18" />

                <div>
                  <span>Total Inquiries</span>

                  <strong>
                    {{ property.inquiries }}
                  </strong>
                </div>
              </div>
            </section>

            <div class="demo-note">
              <Info :size="18" />

              <p>
                Listing data and status changes are stored in the application database. Pending submissions are reviewed by an administrator.
              </p>
            </div>

          </aside>
        </div>

      </template>

      <!-- INVALID PROPERTY ID -->
      <section
        v-else
        class="not-found-card"
      >
        <Building2 :size="36" />

        <h2>Property Not Found</h2>

        <p>
          The requested property does not exist or is not available in your account.
        </p>

        <RouterLink
          :to="`${workspaceBase}/properties`"
          class="return-button"
        >
          <ArrowLeft :size="17" />
          Return to My Properties
        </RouterLink>
      </section>

    </main>
  </AppSidebar>
</template>

<style scoped>
/* PAGE CONTAINER */

.details-page {
  width: 100%;
  max-width: 1350px;
  min-width: 0;
  margin: 0 auto;
}

/* BACK LINK */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 27px;
  color: #64748b;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #2563eb;
}

/* HEADER */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.page-header h1 {
  margin: 10px 0;
  color: #142d4e;
  font-size: clamp(26px, 3vw, 34px);
  letter-spacing: -0.8px;
}

.page-header p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.edit-button,
.return-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 12px 18px;
  border-radius: 9px;
  background: #142d4e;
  border: 1px solid #142d4e;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s;
}

.edit-button:hover,
.return-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* STATUS PANEL */

.status-panel {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 19px 22px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
}

.status-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #475569;
}

.status-icon.approved {
  background: #dcfce7;
  color: #15803d;
}

.status-icon.pending {
  background: #fef9c3;
  color: #a16207;
}

.status-icon.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.status-content {
  flex: 1;
  min-width: 0;
}

.status-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 11px;
}

.status-heading strong {
  color: #142d4e;
  font-size: 14px;
}

.status-content p {
  margin: 9px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.approved {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.pending {
  background: #fef9c3;
  color: #a16207;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #b91c1c;
}

/* MAIN GRID */

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.65fr) minmax(280px, 1fr);
  gap: 23px;
  align-items: start;
}

.main-column,
.side-column {
  display: flex;
  flex-direction: column;
  gap: 22px;
  min-width: 0;
}

/* CARDS */

.details-card {
  min-width: 0;
  padding: 25px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 17px;
  margin-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
  color: #2563eb;
}

.card-heading h2 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

/* PROPERTY IMAGE */

.image-card {
  padding: 12px;
}

.property-image-container {
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 9px;
  background: #f8fafc;
}

.property-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  width: 100%;
  height: 100%;
  padding: 20px;
  color: #94a3b8;
  text-align: center;
}

.image-placeholder > svg {
  color: #64748b;
}

.image-placeholder strong {
  color: #475569;
  font-size: 14px;
}

.image-placeholder p {
  max-width: 280px;
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.7;
}

/* PROPERTY DETAILS */

.property-title {
  margin: 0 0 13px;
  color: #142d4e;
  font-size: 23px;
  overflow-wrap: anywhere;
}

.location-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 24px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.location-line svg {
  flex-shrink: 0;
  color: #2563eb;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  padding-top: 21px;
  border-top: 1px solid #edf2f7;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.detail-item span,
.price-section span,
.area-section span,
.activity-row span {
  color: #94a3b8;
  font-size: 11px;
}

.detail-item strong {
  color: #334155;
  font-size: 13px;
  overflow-wrap: anywhere;
}

/* DESCRIPTION */

.description {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.9;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* PRICE AND AREA */

.price-section {
  display: flex;
  flex-direction: column;
  gap: 9px;
  padding-bottom: 23px;
  margin-bottom: 21px;
  border-bottom: 1px solid #edf2f7;
}

.price-section > strong {
  color: #142d4e;
  font-size: clamp(20px, 2vw, 28px);
  overflow-wrap: anywhere;
}

.price-section .not-specified {
  color: #94a3b8;
  font-size: 16px;
}

.area-section,
.activity-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.area-section > svg,
.activity-row > svg {
  flex-shrink: 0;
  color: #2563eb;
}

.area-section > div,
.activity-row > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.area-section strong,
.activity-row strong {
  color: #142d4e;
  font-size: 13px;
}

.activity-row + .activity-row {
  margin-top: 22px;
}

/* DEMO NOTE */

.demo-note {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 16px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #47617f;
}

.demo-note svg {
  flex-shrink: 0;
  color: #2563eb;
}

.demo-note p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}

/* NOT FOUND */

.not-found-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 50px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}

.not-found-card > svg {
  color: #94a3b8;
}

.not-found-card h2 {
  margin: 0;
  color: #142d4e;
  font-size: 21px;
}

.not-found-card p {
  max-width: 440px;
  margin: 0 0 8px;
  font-size: 13px;
  line-height: 1.7;
}

/* RESPONSIVE */

@media (max-width: 1050px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .edit-button {
    width: 100%;
  }

  .details-card {
    padding: 19px;
  }

  .image-card {
    padding: 9px;
  }

  .property-image-container {
    height: 225px;
  }

  .detail-grid {
    gap: 18px;
  }

  .status-panel {
    padding: 16px;
  }
}

@media (max-width: 400px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
