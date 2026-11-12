import { computed, onMounted, ref } from 'vue'
import { fetchBrokerVerification } from '@/services/verificationService'

export const brokerVerificationRequiredMessage =
  'Your broker verification is pending or rejected. You cannot create or edit listings until verification is approved.'

export function useBrokerVerification(enabled = true) {
  const verificationStatus = ref<string | null>(null)
  const verificationLoading = ref(true)

  onMounted(async () => {
    if (!enabled) {
      verificationLoading.value = false
      return
    }

    try {
      const result = await fetchBrokerVerification()
      verificationStatus.value = result.data?.status ?? null
    } catch {
      verificationStatus.value = null
    } finally {
      verificationLoading.value = false
    }
  })

  return {
    canManageListings: computed(() => verificationStatus.value === 'verified'),
    verificationLoading,
  }
}
