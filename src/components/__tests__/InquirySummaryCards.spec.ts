import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import InquirySummaryCards from '../inquiries/InquirySummaryCards.vue'

describe('InquirySummaryCards', () => {
  it('shows the total and per-status counts', () => {
    const wrapper = mount(InquirySummaryCards, {
      props: { inquiries: [{ status: 'New' }, { status: 'In Progress' }, { status: 'New' }] },
    })

    const values = wrapper.findAll('strong').map((node) => node.text())
    expect(values).toEqual(['3', '2', '1', '0'])
  })
})
