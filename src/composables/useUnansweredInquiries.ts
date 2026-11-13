import { ref } from 'vue'
import { fetchMyInquiries } from '@/services/inquiryService'

/** How long a count stays fresh while moving between workspace pages. */
const CACHE_MS = 60_000

const count = ref(0)
let fetchedAt = 0
let pending: Promise<void> | null = null

/**
 * Number of inquiries still marked "new" (no reply yet) for the signed-in
 * publisher, shown as a badge next to "Inquiries" in the sidebar.
 */
export function useUnansweredInquiries() {
  async function refresh(force = false): Promise<void> {
    if (!force && Date.now() - fetchedAt < CACHE_MS) return
    if (pending) return pending

    pending = fetchMyInquiries()
      .then((response) => {
        count.value = response.data.filter((inquiry) => inquiry.status === 'new').length
        fetchedAt = Date.now()
      })
      .catch(() => {
        // The badge is a convenience; leave the last known value on failure.
      })
      .finally(() => {
        pending = null
      })

    return pending
  }

  return { count, refresh }
}
