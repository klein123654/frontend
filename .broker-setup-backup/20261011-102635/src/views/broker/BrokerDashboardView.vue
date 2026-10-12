
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import {
  Building2,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Plus,
  ArrowRight,
  ShieldCheck,
  Info,
  ClipboardList,
  Inbox
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'

import {
  allBrokerListings
} from '@/stores/brokerListings'

import {
  allBrokerInquiries
} from '@/stores/brokerInquiries'

import {
  formatBrokerPrice
} from '@/data/broker/brokerListings'

// REACTIVE LISTING COUNTS
const totalListings = computed(
  () => allBrokerListings.value.length
)

const approvedListings = computed(
  () =>
    allBrokerListings.value.filter(
      (listing) => listing.status === 'Approved'
    ).length
)

const pendingListings = computed(
  () =>
    allBrokerListings.value.filter(
      (listing) => listing.status === 'Pending'
    ).length
)

// REACTIVE INQUIRY COUNTS
const totalInquiries = computed(
  () => allBrokerInquiries.value.length
)

const newInquiries = computed(
  () =>
    allBrokerInquiries.value.filter(
      (inquiry) => inquiry.status === 'New'
    ).length
)

// RECENT LISTINGS
const recentListings = computed(() =>
  [...allBrokerListings.value]
    .sort((a, b) => {
      const dateDifference =
        b.dateCreated.localeCompare(a.dateCreated)

      return dateDifference !== 0
        ? dateDifference
        : b.id - a.id
    })
    .slice(0, 4)
)
</script>

<template>
  <AppSidebar role="broker">
    <main class="broker-dashboard">

      <!-- HEADER -->
      <header class="page-header">
        <div>
          <span class="eyebrow">
            BROKER WORKSPACE
          </span>

          <h1>Dashboard Overview</h1>

          <p>
            Manage your represented commercial properties,
            monitor inquiries, and review your broker status.
          </p>
        </div>

        <RouterLink
          to="/broker/listings/create"
          class="primary-button"
        >
          <Plus :size="18" />
          Add Listing
        </RouterLink>
      </header>

      <!-- DEMO NOTICE -->
      <div class="demo-notice">
        <Info :size="18" />

        <p>
          <strong>Demo Workspace.</strong>
          Broker listings, inquiries, and verification
          will be connected to Laravel in a later phase.
          No real broker account or backend data is
          connected yet.
        </p>
      </div>

      <!-- SUMMARY CARDS -->
      <section class="stats-grid">

        <article class="stat-card">
          <div class="stat-top">
            <span>Total Listings</span>

            <div class="stat-icon">
              <Building2 :size="20" />
            </div>
          </div>

          <strong>{{ totalListings }}</strong>
          <small>All broker-managed listings</small>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Approved Listings</span>

            <div class="stat-icon approved-icon">
              <CheckCircle2 :size="20" />
            </div>
          </div>

          <strong>{{ approvedListings }}</strong>
          <small>Listings marked as approved</small>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Pending Approval</span>

            <div class="stat-icon pending-icon">
              <Clock3 :size="20" />
            </div>
          </div>

          <strong>{{ pendingListings }}</strong>
          <small>Listings awaiting review</small>
        </article>

        <article class="stat-card">
          <div class="stat-top">
            <span>Total Inquiries</span>

            <div class="stat-icon">
              <MessageSquare :size="20" />
            </div>
          </div>

          <strong>{{ totalInquiries }}</strong>
          <small>{{ newInquiries }} new inquiries</small>
        </article>

      </section>

      <!-- VERIFICATION NOTICE -->
      <section class="verification-panel">
        <div class="verification-icon">
          <ShieldCheck :size="23" />
        </div>

        <div class="verification-content">
          <h2>Broker Verification</h2>

          <p>
            Your verification status will appear here
            after broker registration and administrator
            verification are implemented.
          </p>
        </div>

        <span class="verification-status">
          Not Connected
        </span>
      </section>

      <!-- MAIN CONTENT -->
      <div class="content-grid">

        <!-- RECENT LISTINGS -->
        <section class="content-panel">
          <div class="panel-header">
            <div>
              <h2>Recent Listings</h2>

              <p>
                Your latest broker-managed properties.
              </p>
            </div>

            <RouterLink
              to="/broker/listings"
              class="text-link"
            >
              View All
              <ArrowRight :size="15" />
            </RouterLink>
          </div>

          <div
            v-if="recentListings.length === 0"
            class="empty-state"
          >
            <ClipboardList :size="34" />

            <h3>No Listings Yet</h3>

            <p>
              Properties you manage as a broker will
              appear here once they are added.
            </p>

            <RouterLink
              to="/broker/listings/create"
              class="empty-action"
            >
              <Plus :size="16" />
              Add Your First Listing
            </RouterLink>
          </div>

          <div
            v-else
            class="listing-list"
          >
            <RouterLink
              v-for="listing in recentListings"
              :key="listing.id"
              :to="`/broker/listings/${listing.id}`"
              class="listing-row"
            >
              <div class="listing-thumbnail">
                <img
                  v-if="listing.images[0]"
                  :src="listing.images[0]"
                  :alt="listing.title"
                  loading="lazy"
                />

                <Building2 v-else :size="23" />
              </div>

              <div class="listing-information">
                <strong>{{ listing.title }}</strong>

                <span>
                  {{ listing.location || 'Location not specified' }}
                </span>

                <small>
                  {{
                    listing.price > 0
                      ? formatBrokerPrice(listing.price)
                      : 'Price not specified'
                  }}
                </small>
              </div>

              <span
                class="listing-status"
                :class="listing.status.toLowerCase()"
              >
                {{ listing.status }}
              </span>
            </RouterLink>
          </div>
        </section>

        <!-- QUICK ACTIONS -->
        <aside class="content-panel">
          <div class="panel-header">
            <div>
              <h2>Quick Actions</h2>

              <p>
                Navigate your broker workspace.
              </p>
            </div>
          </div>

          <div class="quick-actions">

            <RouterLink
              to="/broker/listings/create"
              class="quick-action"
            >
              <span class="quick-icon">
                <Plus :size="20" />
              </span>

              <span class="quick-text">
                <strong>Add New Listing</strong>
                <small>Create a commercial property listing</small>
              </span>

              <ArrowRight :size="17" />
            </RouterLink>

            <RouterLink
              to="/broker/listings"
              class="quick-action"
            >
              <span class="quick-icon">
                <Building2 :size="20" />
              </span>

              <span class="quick-text">
                <strong>Manage Listings</strong>
                <small>Review your properties and statuses</small>
              </span>

              <ArrowRight :size="17" />
            </RouterLink>

            <RouterLink
              to="/broker/inquiries"
              class="quick-action"
            >
              <span class="quick-icon">
                <Inbox :size="20" />
              </span>

              <span class="quick-text">
                <strong>View Inquiries</strong>
                <small>Review customer interest</small>
              </span>

              <ArrowRight :size="17" />
            </RouterLink>

            <RouterLink
              to="/broker/profile"
              class="quick-action"
            >
              <span class="quick-icon">
                <ShieldCheck :size="20" />
              </span>

              <span class="quick-text">
                <strong>Broker Profile</strong>
                <small>Verification and account information</small>
              </span>

              <ArrowRight :size="17" />
            </RouterLink>

          </div>
        </aside>

      </div>

    </main>
  </AppSidebar>
</template>

<style scoped>
.broker-dashboard {
  max-width: 1350px;
  min-width: 0;
  margin: 0 auto;
}

/* HEADER */

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 18px;
  border: 1px solid #142d4e;
  border-radius: 9px;
  background: #142d4e;
  color: white;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.primary-button:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* DEMO NOTICE */

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 15px 18px;
  margin-bottom: 24px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #eff6ff;
  color: #47617f;
}

.demo-notice > svg {
  flex-shrink: 0;
  color: #2563eb;
}

.demo-notice p {
  margin: 0;
  font-size: 12px;
  line-height: 1.8;
}

/* STAT CARDS */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 24px;
}

.stat-card {
  min-width: 0;
  padding: 23px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: white;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 21px;
}

.stat-top > span {
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.stat-icon {
  display: grid;
  place-items: center;
  width: 39px;
  height: 39px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
}

.approved-icon {
  background: #dcfce7;
  color: #15803d;
}

.pending-icon {
  background: #fef9c3;
  color: #a16207;
}

.stat-card > strong {
  display: block;
  margin-bottom: 8px;
  color: #142d4e;
  font-size: 30px;
  font-weight: 800;
}

.stat-card small {
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.6;
}

/* VERIFICATION */

.verification-panel {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 22px;
  margin-bottom: 25px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: white;
}

.verification-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #eaf1fc;
  color: #2563eb;
}

.verification-content {
  flex: 1;
  min-width: 0;
}

.verification-content h2 {
  margin: 0 0 7px;
  color: #142d4e;
  font-size: 15px;
}

.verification-content p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.verification-status {
  padding: 8px 12px;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

/* PANELS */

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(290px, 1fr);
  gap: 22px;
  align-items: start;
}

.content-panel {
  min-width: 0;
  padding: 25px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: white;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 24px;
}

.panel-header h2 {
  margin: 0 0 8px;
  color: #142d4e;
  font-size: 18px;
}

.panel-header p {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #2563eb;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.text-link:hover {
  text-decoration: underline;
}

/* EMPTY LISTINGS */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 13px;
  padding: 40px 15px;
  text-align: center;
  color: #94a3b8;
}

.empty-state h3 {
  margin: 0;
  color: #142d4e;
  font-size: 16px;
}

.empty-state p {
  max-width: 320px;
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.7;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 15px;
  margin-top: 5px;
  border: 1px solid #142d4e;
  border-radius: 8px;
  background: #142d4e;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

.empty-action:hover {
  background: #2563eb;
  border-color: #2563eb;
}

/* LISTING ROWS */

.listing-list {
  display: flex;
  flex-direction: column;
}

.listing-row {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px 0;
  border-top: 1px solid #e2e8f0;
  text-decoration: none;
}

.listing-thumbnail {
  display: grid;
  place-items: center;
  width: 76px;
  height: 64px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
  overflow: hidden;
}

.listing-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-information {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.listing-information strong {
  color: #142d4e;
  font-size: 12px;
}

.listing-information span {
  color: #94a3b8;
  font-size: 11px;
}

.listing-information small {
  color: #334155;
  font-size: 11px;
}

.listing-status {
  padding: 6px 9px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.listing-status.approved {
  background: #dcfce7;
  color: #15803d;
}

.listing-status.pending {
  background: #fef9c3;
  color: #a16207;
}

.listing-status.rejected {
  background: #fee2e2;
  color: #b91c1c;
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
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  text-decoration: none;
}

.quick-action:hover {
  background: #f1f7ff;
  border-color: #93c5fd;
}

.quick-icon {
  display: grid;
  place-items: center;
  width: 41px;
  height: 41px;
  flex-shrink: 0;
  border-radius: 9px;
  background: #eaf1fc;
  color: #2563eb;
}

.quick-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.quick-text strong {
  color: #142d4e;
  font-size: 12px;
}

.quick-text small {
  color: #94a3b8;
  font-size: 11px;
}

.quick-action > svg {
  flex-shrink: 0;
  color: #94a3b8;
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

@media (max-width: 650px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
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

  .verification-panel {
    flex-wrap: wrap;
  }

  .verification-status {
    margin-left: 63px;
  }

  .content-panel {
    padding: 18px;
  }
}

@media (max-width: 380px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
