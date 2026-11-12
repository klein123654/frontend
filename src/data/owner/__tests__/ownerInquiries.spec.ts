import { describe, expect, it } from 'vitest'
import { aiPrioritySeverity, countInquiriesByStatus, inquiryStatusSeverity } from '../ownerInquiries'

describe('inquiry display helpers', () => {
  it('maps statuses to tag colours', () => {
    expect(inquiryStatusSeverity('New')).toBe('info')
    expect(inquiryStatusSeverity('In Progress')).toBe('warn')
    expect(inquiryStatusSeverity('Resolved')).toBe('success')
  })

  it('maps AI priorities to tag colours', () => {
    expect(aiPrioritySeverity('high')).toBe('danger')
    expect(aiPrioritySeverity('unscored')).toBe('secondary')
  })

  it('counts inquiries per status', () => {
    expect(countInquiriesByStatus([
      { status: 'New' },
      { status: 'New' },
      { status: 'Resolved' },
    ])).toEqual({ New: 2, 'In Progress': 0, Resolved: 1 })
  })
})
