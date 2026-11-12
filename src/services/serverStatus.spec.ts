import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SLOW_REQUEST_THRESHOLD_MS, isServerWakingUp, trackPendingRequest } from './serverStatus'

describe('server wake-up tracking', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('stays quiet for fast requests', () => {
    const settle = trackPendingRequest()
    vi.advanceTimersByTime(SLOW_REQUEST_THRESHOLD_MS - 1)
    settle()
    vi.advanceTimersByTime(SLOW_REQUEST_THRESHOLD_MS)

    expect(isServerWakingUp.value).toBe(false)
  })

  it('flags slow requests until every one of them settles', () => {
    const settleFirst = trackPendingRequest()
    const settleSecond = trackPendingRequest()
    vi.advanceTimersByTime(SLOW_REQUEST_THRESHOLD_MS)
    expect(isServerWakingUp.value).toBe(true)

    settleFirst()
    expect(isServerWakingUp.value).toBe(true)

    settleSecond()
    expect(isServerWakingUp.value).toBe(false)
  })
})
