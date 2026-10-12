import { computed } from 'vue'
import { useAuth } from '@/composables/useAuth'

export function usePublisherBasePath() {
  const { user } = useAuth()
  return computed(() => user.value?.role === 'developer' ? '/developer' : '/owner')
}
