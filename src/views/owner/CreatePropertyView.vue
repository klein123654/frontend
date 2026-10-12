
<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'

import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Info
} from '@lucide/vue'

import AppSidebar from '@/components/layout/AppSidebar.vue'
import { usePublisherBasePath } from '@/composables/usePublisherBasePath'
import PropertyForm from '@/components/forms/PropertyForm.vue'
import { clearFormDraft } from '@/composables/useFormDraft'

import {
  addOwnerProperty,
  type NewOwnerPropertyInput
} from '@/stores/ownerProperties'

type OwnerFormPayload = Omit<NewOwnerPropertyInput, 'images'> & { images: File[] }


type NoticeType = 'success' | 'warning'

const workspaceBase = usePublisherBasePath()
const route = useRoute()
const confirmation = ref('')
const noticeType = ref<NoticeType>('success')
const lastAction = ref<'Draft' | 'Pending' | null>(null)
const savedPropertyId = ref<number | null>(null)

async function handleSave(property: OwnerFormPayload) {
  try {
    const saved = await addOwnerProperty(property)
    clearFormDraft(`property-${route.fullPath}`)
    lastAction.value = property.status
    savedPropertyId.value = saved.id
    noticeType.value = 'success'
    confirmation.value = property.status === 'Draft'
      ? `Your draft "${property.title}" was saved.`
      : `"${property.title}" was submitted for review.`
  } catch (error) {
    noticeType.value = 'warning'
    confirmation.value = error instanceof Error ? error.message : 'Unable to save the property.'
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
        :to="`${workspaceBase}/properties`"
        class="back-link"
      >
        <ArrowLeft :size="17" />
        Back to My Properties
      </RouterLink>

      <!-- PAGE HEADER -->
      <header class="page-header">
        <span class="eyebrow">
          PUBLISHER WORKSPACE
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
          <strong>Property information</strong>

          <p>
            Your listing and photos are sent to the application server. Submitted listings are reviewed before publication.
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
                ? 'Save Failed'
                : lastAction === 'Draft'
                  ? 'Draft Saved'
                  : 'Listing Submitted'
            }}
          </strong>

          <p>{{ confirmation }}</p>

          <div class="confirmation-actions">
            <RouterLink
              :to="`${workspaceBase}/properties`"
              class="view-properties-link"
            >
              View My Properties
            </RouterLink>

            <span v-if="savedPropertyId !== null" class="record-reference">
              Listing #{{ savedPropertyId }}
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
