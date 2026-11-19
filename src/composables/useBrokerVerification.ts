import { computed, onMounted, ref } from 'vue'
import { fetchBrokerVerification } from '@/services/verificationService'
import type { CredentialStatus } from '@/types/property'

export const brokerVerificationRequiredMessage =
  'Your broker verification is pending or rejected. You cannot create or edit listings until verification is approved.'

export const brokerCredentialsExpiredMessage =
  'Your PRC license or DHSUD registration has expired, or its validity date is missing. Update it in your broker profile to manage listings again. Your existing listings stay public.'

export function useBrokerVerification(enabled = true) {
  const verificationStatus = ref<string | null>(null)
  const credentialStatus = ref<CredentialStatus | null>(null)
  const verificationLoading = ref(true)

  onMounted(async () => {
    if (!enabled) {
      verificationLoading.value = false
      return
    }

    try {
      const result = await fetchBrokerVerification()
      verificationStatus.value = result.data?.status ?? null
      credentialStatus.value = result.data?.credential_status ?? null
    } catch {
      verificationStatus.value = null
    } finally {
      verificationLoading.value = false
    }
  })

  const credentialsLapsed = computed(() => credentialStatus.value === 'expired' || credentialStatus.value === 'missing')

  return {
    canManageListings: computed(() => verificationStatus.value === 'verified' && !credentialsLapsed.value),
    /** Shown when listings are blocked: why, and what to do. */
    blockedMessage: computed(() =>
      verificationStatus.value === 'verified' && credentialsLapsed.value
        ? brokerCredentialsExpiredMessage
        : brokerVerificationRequiredMessage,
    ),
    verificationLoading,
  }
}
