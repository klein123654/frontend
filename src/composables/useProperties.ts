import { ref } from 'vue'
import type { Property } from '@/types/property'
import {
  fetchPublicProperties,
  type PropertySearchFilters,
} from '@/services/propertyService'

export function useProperties() {
  const properties = ref<Property[]>([])
  const loading = ref(false)
  const error = ref('')
  const total = ref(0)

  let requestVersion = 0

  async function load(filters: PropertySearchFilters = {}) {
    const version = ++requestVersion

    loading.value = true
    error.value = ''

    try {
      const result = await fetchPublicProperties(filters)

      if (version !== requestVersion) return

      properties.value = result.properties
      total.value = result.total
    } catch (cause) {
      if (version !== requestVersion) return

      error.value =
        cause instanceof Error
          ? cause.message
          : 'Unable to load properties. Please try again.'

      properties.value = []
      total.value = 0
    } finally {
      if (version === requestVersion) {
        loading.value = false
      }
    }
  }

  return { properties, loading, error, total, load }
}
