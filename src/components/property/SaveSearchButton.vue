<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BellPlus, Check } from '@lucide/vue'
import { useAuth } from '@/composables/useAuth'
import { createSavedSearch } from '@/services/savedSearchService'
import { describeFilters, filtersFromBrowseState, hasSavableFilters } from '@/utils/savedSearch'
import { parseBrowseQuery } from '@/utils/propertyQuery'

const route = useRoute()
const { user } = useAuth()

const filters = computed(() => filtersFromBrowseState(parseBrowseQuery(route.query)))
const canSave = computed(() => hasSavableFilters(filters.value))
const saving = ref(false)
const savedFor = ref('')
const errorText = ref('')
const filterKey = computed(() => JSON.stringify(filters.value))

// A different search can be saved again.
watch(filterKey, () => {
  savedFor.value = ''
  errorText.value = ''
})

async function save() {
  saving.value = true
  errorText.value = ''
  try {
    await createSavedSearch(describeFilters(filters.value), filters.value)
    savedFor.value = filterKey.value
  } catch (cause) {
    errorText.value = cause instanceof Error ? cause.message : 'Unable to save this search.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="user?.role !== 'admin'" class="save-search">
    <template v-if="!user">
      <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="save-search-link">
        <BellPlus :size="16" aria-hidden="true" /> Sign in to get alerts for this search
      </RouterLink>
    </template>
    <template v-else-if="savedFor === filterKey">
      <span class="saved" role="status">
        <Check :size="16" aria-hidden="true" /> Saved. We'll email you when new listings match.
        <RouterLink to="/buyer/saved-properties#saved-searches">Manage</RouterLink>
      </span>
    </template>
    <template v-else>
      <button type="button" :disabled="!canSave || saving" :title="canSave ? '' : 'Choose a filter first'" @click="save">
        <BellPlus :size="16" aria-hidden="true" />
        {{ saving ? 'Saving…' : 'Save search & get email alerts' }}
      </button>
      <span v-if="!canSave" class="hint">Choose a type, barangay, price or keyword to save this search.</span>
    </template>
    <span v-if="errorText" class="error" role="alert">{{ errorText }}</span>
  </div>
</template>

<style scoped>
.save-search {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  margin: -10px 0 20px;
  font-size: 13px;
}

.save-search button,
.save-search-link {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  font: inherit;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.save-search button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.saved {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  color: #166534;
  font-weight: 600;
}

.saved a {
  color: #1d4ed8;
}

.hint {
  color: #64748b;
}

.error {
  color: #b91c1c;
}
</style>
