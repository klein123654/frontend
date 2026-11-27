
<script setup lang="ts">
import { useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Info } from '@lucide/vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import PropertyForm from '@/components/forms/PropertyForm.vue'
import SaveResultDialog from '@/components/common/SaveResultDialog.vue'
import { clearFormDraft } from '@/composables/useFormDraft'
import { useListingSaveDialog } from '@/composables/useListingSaveDialog'
import { addOwnerProperty, type NewOwnerPropertyInput } from '@/stores/ownerProperties'

type OwnerFormPayload = Omit<NewOwnerPropertyInput, 'images'> & { images: File[]; title: string; status: 'Draft' | 'Pending' }

const workspaceBase = '/owner'
const route = useRoute()

const { dialog, busy, formKey, primaryLabel, submit, primary, close } = useListingSaveDialog<OwnerFormPayload>({
  mode: 'create',
  listPath: `${workspaceBase}/properties`,
  save: (input) => addOwnerProperty(input),
  afterSave: () => clearFormDraft(`property-${route.fullPath}`),
})
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
          <strong>Before it goes live</strong>

          <p>
            An administrator reviews every new listing before it appears in public search results. We'll email you when it's approved, or tell you what to fix.
          </p>
        </div>
      </div>

      <!-- REUSABLE PROPERTY FORM -->
      <PropertyForm :key="formKey" @save="submit" />

      <SaveResultDialog
        :open="dialog.open"
        :variant="dialog.variant"
        :title="dialog.title"
        :message="dialog.message"
        :note="dialog.note"
        :primary-label="primaryLabel"
        link-label="View my properties"
        :link-to="`${workspaceBase}/properties`"
        :busy="busy"
        @primary="primary"
        @close="close"
      />

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
  color: #5e6d82;
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
  color: #5e6d82;
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

/* RESPONSIVE */

@media (max-width: 650px) {
  .back-link {
    margin-bottom: 22px;
  }

  .demo-notice {
    padding: 15px;
  }
}
</style>
