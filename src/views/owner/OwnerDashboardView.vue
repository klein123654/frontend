
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Building2 } from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'

import { formatOwnerPrice } from '@/data/owner/ownerProperties'
import { allOwnerProperties, loadOwnerProperties } from '@/stores/ownerProperties'
import { allOwnerInquiries, loadOwnerInquiries } from '@/stores/ownerInquiries'

const router = useRouter()
const workspaceBase = usePublisherBasePath()
onMounted(() => Promise.all([loadOwnerProperties(), loadOwnerInquiries()]))

// RECENT PROPERTIES
// Uses the shared reactive property store.
const recentProperties = computed(() =>
  [...allOwnerProperties.value]
    .sort((a, b) => {
      const dateDifference =
        b.dateCreated.localeCompare(a.dateCreated)

      if (dateDifference !== 0) {
        return dateDifference
      }

      return b.id - a.id
    })
    .slice(0, 4)
)

// PROPERTY STATISTICS

const totalProperties = computed(
  () => allOwnerProperties.value.length
)

const approvedProperties = computed(
  () =>
    allOwnerProperties.value.filter(
      (property) => property.status === 'Approved'
    ).length
)

const pendingProperties = computed(
  () =>
    allOwnerProperties.value.filter(
      (property) => property.status === 'Pending'
    ).length
)

// INQUIRY STATISTICS
// Both values come from the same store
// used by the Owner Inquiries page.

const totalInquiries = computed(
  () => allOwnerInquiries.value.length
)

const newInquiries = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'New'
    ).length
)

const inProgressInquiries = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'In Progress'
    ).length
)

const resolvedInquiries = computed(
  () =>
    allOwnerInquiries.value.filter(
      (inquiry) => inquiry.status === 'Resolved'
    ).length
)

// SHARED PRICE FORMATTER

const formatPrice = formatOwnerPrice

// NAVIGATION

function navigateTo(path: string) {
  void router.push(`${workspaceBase.value}${path}`)
}
</script>

<template>
  <AppSidebar role="owner">
    <div class="dashboard">

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <span class="eyebrow">
            PUBLISHER WORKSPACE
          </span>

          <h1>Dashboard Overview</h1>

          <p>
            View your property activity and manage
            listings in one place.
          </p>
        </div>

        <button
          class="primary-button"
          type="button"
          @click="navigateTo('/properties/create')"
        >
          <span aria-hidden="true">+</span>
          Add Property
        </button>
      </div>

      <div class="demo-notice">
        <strong>Owner workspace</strong>

        <span>
          Your property listings and customer inquiries are loaded from the application database.
        </span>
      </div>

      <!-- STATISTICS -->
      <div class="stats-grid">

        <!-- TOTAL PROPERTIES -->
        <article class="stat-card">
          <div class="stat-top">
            <span>Total Properties</span>
            <span class="stat-icon">01</span>
          </div>

          <strong>{{ totalProperties }}</strong>

          <small>
            All submitted and draft listings
          </small>
        </article>

        <!-- APPROVED PROPERTIES -->
        <article class="stat-card">
          <div class="stat-top">
            <span>Approved Listings</span>
            <span class="stat-icon">02</span>
          </div>

          <strong>{{ approvedProperties }}</strong>

          <small>
            Listings marked as approved
          </small>
        </article>

        <!-- PENDING PROPERTIES -->
        <article class="stat-card">
          <div class="stat-top">
            <span>Pending Approval</span>
            <span class="stat-icon">03</span>
          </div>

          <strong>{{ pendingProperties }}</strong>

          <small>
            Listings marked as pending
          </small>
        </article>

        <!-- TOTAL INQUIRIES -->
        <article class="stat-card">
          <div class="stat-top">
            <span>Total Inquiries</span>
            <span class="stat-icon">04</span>
          </div>

          <strong>{{ totalInquiries }}</strong>

          <small>
            {{ newInquiries }} new inquiries
            awaiting attention
          </small>
        </article>

      </div>

      <!-- INQUIRY STATUS SUMMARY -->
      <section class="inquiry-summary">

        <div class="inquiry-summary-heading">
          <div>
            <h2>Inquiry Overview</h2>

            <p>
              Current status of customer inquiries
              associated with your listings.
            </p>
          </div>

          <button
            type="button"
            class="text-button"
            @click="navigateTo('/inquiries')"
          >
            Manage Inquiries →
          </button>
        </div>

        <div class="inquiry-status-grid">

          <div class="inquiry-status-item">
            <span class="status-dot new-dot"></span>

            <span>New</span>

            <strong>{{ newInquiries }}</strong>
          </div>

          <div class="inquiry-status-item">
            <span class="status-dot progress-dot"></span>

            <span>In Progress</span>

            <strong>{{ inProgressInquiries }}</strong>
          </div>

          <div class="inquiry-status-item">
            <span class="status-dot closed-dot"></span>

            <span>Resolved</span>

            <strong>{{ resolvedInquiries }}</strong>
          </div>

        </div>
      </section>

      <!-- MAIN CONTENT GRID -->
      <div class="content-grid">

        <!-- RECENT PROPERTIES -->
        <section class="content-panel">

          <div class="panel-header">
            <div>
              <h2>Recent Properties</h2>

              <p>
                Your latest property listings and
                their status.
              </p>
            </div>

            <button
              class="text-button"
              type="button"
              @click="navigateTo('/properties')"
            >
              View All →
            </button>
          </div>

          <!-- PROPERTY LIST -->
          <div class="property-list">

            <article
              v-for="property in recentProperties"
              :key="property.id"
              class="property-row"
            >

              <!-- PROPERTY IMAGE -->
              <img
                v-if="property.images.length > 0 && property.images[0]"
                :src="property.images[0]"
                :alt="property.title"
                class="property-image"
                loading="lazy"
              />

              <!-- IMAGE PLACEHOLDER -->
              <div
                v-else
                class="property-image-placeholder"
                role="img"
                aria-label="Property image unavailable"
              >
                <Building2 :size="26" />
              </div>

              <!-- PROPERTY INFORMATION -->
              <div class="property-info">

                <h3>
                  {{ property.title }}
                </h3>

                <p>
                  {{
                    property.location ||
                    'Location not specified'
                  }}
                </p>

                <strong v-if="property.price > 0">
                  {{ formatPrice(property.price) }}

                  <span
                    v-if="property.listingType === 'For Rent'"
                  >
                    / month
                  </span>
                </strong>

                <strong
                  v-else
                  class="price-unavailable"
                >
                  Price not specified
                </strong>

              </div>

              <!-- PROPERTY STATUS -->
              <span
                class="status-badge"
                :class="property.status.toLowerCase()"
              >
                {{ property.status }}
              </span>

            </article>

            <!-- EMPTY STATE -->
            <div
              v-if="recentProperties.length === 0"
              class="empty-properties"
            >
              No properties available yet.
            </div>

          </div>

        </section>

        <!-- QUICK ACTIONS -->
        <aside class="content-panel quick-panel">

          <div class="panel-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Manage your workspace efficiently.
              </p>
            </div>
          </div>

          <div class="quick-actions">

            <!-- ADD PROPERTY -->
            <button
              type="button"
              class="quick-action"
              @click="navigateTo('/properties/create')"
            >
              <span
                class="quick-icon"
                aria-hidden="true"
              >
                +
              </span>

              <span>
                <strong>Add New Property</strong>
                <small>Create a property listing</small>
              </span>

              <span
                class="action-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>

            <!-- MANAGE PROPERTIES -->
            <button
              type="button"
              class="quick-action"
              @click="navigateTo('/properties')"
            >
              <span
                class="quick-icon"
                aria-hidden="true"
              >
                ▤
              </span>

              <span>
                <strong>Manage Properties</strong>
                <small>View your listing statuses</small>
              </span>

              <span
                class="action-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>

            <!-- MANAGE INQUIRIES -->
            <button
              type="button"
              class="quick-action"
              @click="navigateTo('/inquiries')"
            >
              <span
                class="quick-icon"
                aria-hidden="true"
              >
                ✉
              </span>

              <span>
                <strong>View Inquiries</strong>

                <small>
                  {{ newInquiries }} new inquiries
                  awaiting attention
                </small>
              </span>

              <span
                class="action-arrow"
                aria-hidden="true"
              >
                →
              </span>
            </button>

          </div>

          <!-- APPROVAL INFORMATION -->
          <div class="approval-info">
            <strong>
              How listing approval works
            </strong>

            <p>
              When Laravel backend functionality is
              implemented, submitted listings will
              be reviewed by an administrator before
              appearing publicly.
            </p>
          </div>

        </aside>

      </div>

    </div>
  </AppSidebar>
</template>

<style scoped>
/* DASHBOARD CONTAINER */

.dashboard {
  max-width: 1350px;
  margin: 0 auto;
  min-width: 0;
}

/* PAGE HEADER */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 25px;
}

.eyebrow {
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.3px;
}

.page-header h1 {
  color: #142d4e;
  font-size: clamp(26px, 3vw, 34px);
  letter-spacing: -0.8px;
  margin: 10px 0;
}

.page-header p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  margin: 0;
}

.primary-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 18px;
  background: #142d4e;
  border: 1px solid #142d4e;
  border-radius: 9px;
  color: white;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 0.2s,
    border-color 0.2s;
}

.primary-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* DEMO NOTICE */

.demo-notice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 15px 18px;
  margin-bottom: 25px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  color: #47617f;
  font-size: 12px;
  line-height: 1.7;
}

.demo-notice strong {
  color: #1d4ed8;
  white-space: nowrap;
}

/* STATISTICS */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 23px;
  min-width: 0;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
}

.stat-top > span:first-child {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
  font-size: 11px;
  font-weight: 800;
}

.stat-card > strong {
  display: block;
  color: #142d4e;
  font-size: 31px;
  font-weight: 800;
  margin-bottom: 8px;
}

.stat-card small {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

/* INQUIRY OVERVIEW */

.inquiry-summary {
  padding: 21px 24px;
  margin-bottom: 28px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: white;
}

.inquiry-summary-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.inquiry-summary-heading h2 {
  margin: 0 0 7px;
  color: #142d4e;
  font-size: 17px;
}

.inquiry-summary-heading p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
}

.inquiry-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
}

.inquiry-status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 14px 17px;
  border: 1px solid #edf2f7;
  border-radius: 10px;
  background: #f8fafc;
}

.inquiry-status-item > span:nth-child(2) {
  flex: 1;
  min-width: 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.inquiry-status-item strong {
  color: #142d4e;
  font-size: 20px;
  font-weight: 800;
}

.status-dot {
  width: 9px;
  height: 9px;
  flex-shrink: 0;
  border-radius: 50%;
}

.new-dot {
  background: #2563eb;
}

.progress-dot {
  background: #eab308;
}

.closed-dot {
  background: #16a34a;
}

/* MAIN CONTENT GRID */

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(290px, 1fr);
  gap: 22px;
  align-items: start;
}

.content-panel {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 25px;
  min-width: 0;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 24px;
}

.panel-header h2 {
  color: #142d4e;
  font-size: 18px;
  margin: 0 0 8px;
}

.panel-header p {
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.6;
  margin: 0;
}

.text-button {
  border: none;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.text-button:hover {
  color: #1d4ed8;
}

/* RECENT PROPERTIES */

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
  color: #94a3b8;
  font-size: 11px;
  margin: 0 0 9px;
  overflow-wrap: anywhere;
}

.property-info strong {
  color: #142d4e;
  font-size: 13px;
}

.property-info strong span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 400;
}

.property-info .price-unavailable {
  color: #94a3b8;
  font-weight: 500;
}

/* PROPERTY STATUS BADGES */

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
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

/* QUICK ACTIONS */

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: 13px;
  width: 100%;
  padding: 14px;
  text-align: left;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.quick-action:hover {
  border-color: #93c5fd;
  background: #f1f7ff;
}

.quick-icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
  font-size: 20px;
}

.quick-action > span:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.quick-action strong {
  color: #142d4e;
  font-size: 12px;
}

.quick-action small {
  color: #94a3b8;
  font-size: 11px;
}

.action-arrow {
  color: #94a3b8;
  font-size: 17px;
}

/* APPROVAL INFORMATION */

.approval-info {
  margin-top: 26px;
  padding: 18px;
  border-radius: 10px;
  background: #eaf1fc;
}

.approval-info strong {
  color: #142d4e;
  font-size: 13px;
}

.approval-info p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.8;
  margin-bottom: 0;
}

/* RESPONSIVE */

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 750px) {
  .inquiry-status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .primary-button {
    width: 100%;
  }

  .stats-grid {
    gap: 12px;
  }

  .stat-card {
    padding: 17px;
  }

  .stat-card > strong {
    font-size: 26px;
  }

  .inquiry-summary {
    padding: 18px;
  }

  .inquiry-summary-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .content-panel {
    padding: 18px;
  }

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

  .demo-notice {
    flex-direction: column;
    gap: 3px;
  }
}

@media (max-width: 380px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
