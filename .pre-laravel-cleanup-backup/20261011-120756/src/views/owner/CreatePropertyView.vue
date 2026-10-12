
<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import PropertyForm from '@/components/forms/PropertyForm.vue'

import {
  addOwnerProperty,
  type NewOwnerPropertyInput
} from '@/stores/ownerProperties'

type NoticeType = 'success' | 'warning'

const confirmation = ref('')
const noticeType = ref<NoticeType>('success')
const lastAction = ref<'Draft' | 'Pending' | null>(null)
const savedPropertyId = ref<number | null>(null)

function handleSave(property: NewOwnerPropertyInput) {
  const result = addOwnerProperty(property)

  lastAction.value = property.status
  savedPropertyId.value = result.property.id

  if (result.persisted) {
    noticeType.value = 'success'

    if (property.status === 'Draft') {
      confirmation.value =
        `Your draft "${property.title}" was saved in this browser. ` +
        'You can find it under My Properties.'
    } else {
      confirmation.value =
        `"${property.title}" was saved as a Pending listing ` +
        'in this browser. No real administrator has been notified.'
    }
  } else {
    noticeType.value = 'warning'

    confirmation.value =
      `"${property.title}" was added to the current demo session, ` +
      'but it could not be saved in browser storage. ' +
      'It may disappear when you refresh the page.'
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <AppSidebar role="owner">
    <main class="create-property-page">

      <!-- BACK NAVIGATION -->
      <RouterLink
        to="/owner/properties"
        class="back-link"
      >
        <ArrowLeft :size="17" />
        Back to My Properties
      </RouterLink>

      <!-- PAGE HEADER -->
      <header class="page-header">
        <span class="eyebrow">
          PROPERTY OWNER WORKSPACE
        </span>

        <h1>Add New Property</h1>

        <p>
          Provide accurate information about your commercial
          property in Butuan City.
        </p>
      </header>

      <!-- DEMO NOTICE -->
      <div class="demo-notice">
        <Info :size="19" />

        <div>
          <strong>Frontend Demonstration</strong>

          <p>
            Properties created here are stored locally in your
            browser when storage is available. They are not
            uploaded to a server or submitted to a real administrator.
            Selected image files are not saved.
          </p>
        </div>
      </div>

      <!-- SAVE CONFIRMATION -->
      <div
        v-if="confirmation"
        class="confirmation"
        :class="{ 'confirmation-warning': noticeType === 'warning' }"
        role="status"
        aria-live="polite"
      >
        <AlertTriangle
          v-if="noticeType === 'warning'"
          :size="22"
        />

        <CheckCircle2
          v-else
          :size="22"
        />

        <div>
          <strong>
            {{
              noticeType === 'warning'
                ? 'Browser Storage Unavailable'
                : lastAction === 'Draft'
                  ? 'Draft Saved Locally'
                  : 'Pending Listing Saved Locally'
            }}
          </strong>

          <p>{{ confirmation }}</p>

          <div class="confirmation-actions">
            <RouterLink
              to="/owner/properties"
              class="view-properties-link"
            >
              View My Properties
            </RouterLink>

            <span v-if="savedPropertyId !== null" class="record-reference">
              Demo Listing #{{ savedPropertyId }}
            </span>
          </div>
        </div>
      </div>

      <!-- REUSABLE PROPERTY FORM -->
      <PropertyForm @save="handleSave" />

    </main>
  </AppSidebar>
</template>

<style scoped>
.create-property-page {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  min-width: 0;
}

/* BACK NAVIGATION */

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
  color: #64748b;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: color 0.2s;
}

.back-link:hover {
  color: #2563eb;
}

/* PAGE HEADER */

.page-header {
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

/* DEMO NOTICE */

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 17px 20px;
  margin-bottom: 24px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 11px;
  color: #47617f;
}

.demo-notice > svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #2563eb;
}

.demo-notice strong {
  color: #1d4ed8;
  font-size: 13px;
}

.demo-notice p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
}

/* SAVE CONFIRMATION */

.confirmation {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 18px 20px;
  margin-bottom: 24px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 11px;
  color: #15803d;
}

.confirmation > svg {
  flex-shrink: 0;
}

.confirmation strong {
  font-size: 13px;
}

.confirmation p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
}

.confirmation-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 15px;
}

.view-properties-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s;
}

.view-properties-link:hover {
  background: #dcfce7;
}

.record-reference {
  color: #64748b;
  font-size: 11px;
}

/* STORAGE WARNING */

.confirmation-warning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}

.confirmation-warning .view-properties-link {
  border-color: #fde68a;
  color: #92400e;
}

.confirmation-warning .view-properties-link:hover {
  background: #fef3c7;
}

/* RESPONSIVE */

@media (max-width: 650px) {
  .back-link {
    margin-bottom: 22px;
  }

  .demo-notice,
  .confirmation {
    padding: 15px;
  }

  .confirmation-actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
