
<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info,
  PencilLine
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import PropertyForm from '@/components/forms/PropertyForm.vue'

import {
  getEditableOwnerProperty,
  updateOwnerProperty,
  type NewOwnerPropertyInput
} from '@/stores/ownerProperties'

const route = useRoute()

const propertyId = computed(() => {
  const id = Number(route.params.id)

  return Number.isSafeInteger(id) && id > 0
    ? id
    : null
})

const property = computed(() =>
  propertyId.value === null
    ? undefined
    : getEditableOwnerProperty(propertyId.value)
)

const confirmation = ref('')
const errorMessage = ref('')
const storageWarning = ref(false)

function handleSave(values: NewOwnerPropertyInput) {
  confirmation.value = ''
  errorMessage.value = ''
  storageWarning.value = false

  if (propertyId.value === null) {
    errorMessage.value = 'Invalid property ID.'
    return
  }

  const result = updateOwnerProperty(
    propertyId.value,
    values
  )

  if (!result.updated) {
    errorMessage.value =
      'This property could not be updated. ' +
      'Only locally saved Draft listings can be edited.'
    return
  }

  if (!result.persisted) {
    storageWarning.value = true

    errorMessage.value =
      'Your changes are visible in this session, ' +
      'but browser storage could not save them. ' +
      'They may disappear after refreshing the page.'
  } else {
    confirmation.value =
      `Changes to "${values.title}" were saved ` +
      'in this browser. The listing remains a Draft.'
  }

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <AppSidebar role="owner">
    <main class="edit-property-page">

      <!-- BACK LINK -->
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

        <h1>Edit Property</h1>

        <p>
          Update the information of your existing
          commercial property listing.
        </p>
      </header>

      <!-- EDITABLE PROPERTY -->
      <template v-if="property">

        <div class="property-context">
          <div class="context-icon">
            <PencilLine :size="20" />
          </div>

          <div>
            <strong>{{ property.title }}</strong>

            <p>
              Listing #{{ property.id }}
              <span class="separator">•</span>
              Draft
            </p>
          </div>
        </div>

        <!-- DEMO NOTICE -->
        <div class="demo-notice">
          <Info :size="19" />

          <div>
            <strong>Editing a Local Draft</strong>

            <p>
              You are editing a property saved in this browser.
              Changes will update the same listing instead of
              creating a new one. Image management and
              server-side saving will be added with Laravel.
            </p>
          </div>
        </div>

        <!-- SUCCESS MESSAGE -->
        <div
          v-if="confirmation"
          class="feedback success-feedback"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 :size="21" />

          <div>
            <strong>Changes Saved</strong>
            <p>{{ confirmation }}</p>

            <RouterLink
              to="/owner/properties"
              class="feedback-link"
            >
              View My Properties
            </RouterLink>
          </div>
        </div>

        <!-- ERROR OR STORAGE WARNING -->
        <div
          v-if="errorMessage"
          class="feedback warning-feedback"
          role="alert"
        >
          <AlertTriangle :size="21" />

          <div>
            <strong>
              {{
                storageWarning
                  ? 'Browser Storage Unavailable'
                  : 'Unable to Save Changes'
              }}
            </strong>

            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- PRE-FILLED SHARED FORM -->
        <PropertyForm
          mode="edit"
          :initial-values="property"
          @save="handleSave"
        />

      </template>

      <!-- INVALID, MISSING, OR NON-EDITABLE LISTING -->
      <div v-else class="not-found-card">
        <AlertTriangle :size="34" />

        <h2>Property Cannot Be Edited</h2>

        <p>
          This property does not exist, is not a locally
          saved listing, or is no longer in Draft status.
          Only browser-saved Draft listings can be edited
          in this demonstration.
        </p>

        <RouterLink
          to="/owner/properties"
          class="return-button"
        >
          <ArrowLeft :size="16" />
          Return to My Properties
        </RouterLink>
      </div>

    </main>
  </AppSidebar>
</template>

<style scoped>
/* PAGE */

.edit-property-page {
  width: 100%;
  max-width: 1100px;
  min-width: 0;
  margin: 0 auto;
}

/* BACK LINK */

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

/* HEADER */

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

/* SELECTED PROPERTY */

.property-context {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px 20px;
  margin-bottom: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #ffffff;
}

.context-icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #eaf1fc;
  color: #2563eb;
}

.property-context strong {
  color: #142d4e;
  font-size: 13px;
}

.property-context p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
}

.separator {
  margin: 0 7px;
}

/* INFORMATION NOTICE */

.demo-notice {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 17px 20px;
  margin-bottom: 24px;
  border: 1px solid #dbeafe;
  border-radius: 11px;
  background: #eff6ff;
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

/* SAVE FEEDBACK */

.feedback {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 18px 20px;
  margin-bottom: 24px;
  border-radius: 11px;
}

.feedback > svg {
  flex-shrink: 0;
}

.feedback strong {
  font-size: 13px;
}

.feedback p {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
}

.success-feedback {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}

.warning-feedback {
  border: 1px solid #fde68a;
  background: #fffbeb;
  color: #92400e;
}

.feedback-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 14px;
  padding: 10px 14px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #ffffff;
  color: #166534;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.feedback-link:hover {
  background: #dcfce7;
}

/* NOT FOUND */

.not-found-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 45px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #ffffff;
  color: #64748b;
  text-align: center;
}

.not-found-card > svg {
  color: #d97706;
}

.not-found-card h2 {
  margin: 0;
  color: #142d4e;
  font-size: 20px;
}

.not-found-card p {
  max-width: 500px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}

.return-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
  padding: 12px 16px;
  border-radius: 9px;
  background: #142d4e;
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.return-button:hover {
  background: #2563eb;
}

/* MOBILE */

@media (max-width: 650px) {
  .back-link {
    margin-bottom: 22px;
  }

  .property-context,
  .demo-notice,
  .feedback {
    padding: 15px;
  }

  .not-found-card {
    padding: 32px 18px;
  }
}
</style>
