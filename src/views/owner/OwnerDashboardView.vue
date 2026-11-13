
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import AiMarketInsight from '@/components/dashboard/AiMarketInsight.vue'
import DashboardPanel from '@/components/dashboard/DashboardPanel.vue'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import PublisherQuickActions from '@/components/dashboard/PublisherQuickActions.vue'
import RecentPropertiesList from '@/components/dashboard/RecentPropertiesList.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'

import { countInquiriesByStatus } from '@/data/owner/ownerInquiries'
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

// SUMMARY STATISTICS

const inquiryCounts = computed(() => countInquiriesByStatus(allOwnerInquiries.value))

const stats = computed(() => {
  const properties = allOwnerProperties.value
  return [
    { label: 'Total Properties', value: properties.length, note: 'All submitted and draft listings' },
    { label: 'Approved Listings', value: properties.filter((property) => property.status === 'Approved').length, note: 'Listings marked as approved' },
    { label: 'Pending Approval', value: properties.filter((property) => property.status === 'Pending').length, note: 'Listings marked as pending' },
    { label: 'Total Inquiries', value: allOwnerInquiries.value.length, note: `${inquiryCounts.value.New} new inquiries awaiting attention` },
    { label: 'Listing Views', value: properties.reduce((sum, property) => sum + (property.views ?? 0), 0), note: 'Visits to your public listing pages' },
  ]
})

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

      <div class="stats-grid">
        <DashboardStatCard
          v-for="(stat, index) in stats"
          :key="stat.label"
          :label="stat.label"
          :marker="String(index + 1).padStart(2, '0')"
          :value="stat.value"
          :note="stat.note"
        />
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

            <strong>{{ inquiryCounts.New }}</strong>
          </div>

          <div class="inquiry-status-item">
            <span class="status-dot progress-dot"></span>

            <span>In Progress</span>

            <strong>{{ inquiryCounts['In Progress'] }}</strong>
          </div>

          <div class="inquiry-status-item">
            <span class="status-dot closed-dot"></span>

            <span>Resolved</span>

            <strong>{{ inquiryCounts.Resolved }}</strong>
          </div>

        </div>
      </section>

      <AiMarketInsight class="market-insight-widget" />

      <!-- MAIN CONTENT GRID -->
      <div class="content-grid">

        <DashboardPanel
          title="Recent Properties"
          description="Your latest property listings and their status."
          action-label="View All →"
          @action="navigateTo('/properties')"
        >
          <RecentPropertiesList :properties="recentProperties" />
        </DashboardPanel>

        <DashboardPanel
          tag="aside"
          class="quick-panel"
          title="Quick Actions"
          description="Manage your workspace efficiently."
        >
          <PublisherQuickActions :new-inquiry-count="inquiryCounts.New" @navigate="navigateTo" />
        </DashboardPanel>
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
  color: #5e6d82;
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
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 18px;
  margin-bottom: 22px;
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
  color: #5e6d82;
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
  color: #5e6d82;
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

/* RECENT PROPERTIES *//* PROPERTY STATUS BADGES *//* QUICK ACTIONS */

/* APPROVAL INFORMATION */

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

  .inquiry-summary {
    padding: 18px;
  }

  .inquiry-summary-heading {
    align-items: flex-start;
    flex-direction: column;
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
