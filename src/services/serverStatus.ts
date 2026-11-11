import { computed, ref } from 'vue'

/** Requests slower than this are probably waiting for the sleeping backend to start. */
export const SLOW_REQUEST_THRESHOLD_MS = 4000

const slowRequestCount = ref(0)

/** True while at least one API request has been waiting longer than the threshold. */
export const isServerWakingUp = computed(() => slowRequestCount.value > 0)

/**
 * Track a pending request. Returns a function that must be called when the
 * request settles.
 */
export function trackPendingRequest(): () => void {
  let isMarkedSlow = false
  const timer = setTimeout(() => {
    isMarkedSlow = true
    slowRequestCount.value += 1
  }, SLOW_REQUEST_THRESHOLD_MS)

  return () => {
    clearTimeout(timer)
    if (isMarkedSlow) {
      slowRequestCount.value = Math.max(0, slowRequestCount.value - 1)
    }
  }
}
