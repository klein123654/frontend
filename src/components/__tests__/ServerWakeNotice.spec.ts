import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ServerWakeNotice from '../common/ServerWakeNotice.vue'
import { SLOW_REQUEST_THRESHOLD_MS, trackPendingRequest } from '@/services/serverStatus'

describe('ServerWakeNotice', () => {
  afterEach(() => vi.useRealTimers())

  it('announces the wake-up message only while a request is slow', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ServerWakeNotice)
    expect(wrapper.text()).toBe('')

    const settle = trackPendingRequest()
    vi.advanceTimersByTime(SLOW_REQUEST_THRESHOLD_MS)
    await nextTick()
    expect(wrapper.get('[aria-live="polite"]').text()).toContain('The server is waking up')

    settle()
    await nextTick()
    expect(wrapper.text()).toBe('')
    wrapper.unmount()
  })
})
