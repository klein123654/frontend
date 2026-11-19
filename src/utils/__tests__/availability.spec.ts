import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AvailabilityBadge from '@/components/common/AvailabilityBadge.vue'
import StatusLegend from '@/components/common/StatusLegend.vue'
import ListingStatusCell from '@/components/property/ListingStatusCell.vue'
import { AVAILABILITY_META, AVAILABILITY_ORDER, TONE_COLORS, acceptsInquiries, legendItems } from '../availability'
import { buildPropertySearchParams } from '@/services/propertyService'

describe('availability colours', () => {
  it('gives each availability its own colour and a text label', () => {
    expect(AVAILABILITY_ORDER.map((key) => AVAILABILITY_META[key].tone)).toEqual(['green', 'amber', 'red', 'grey'])
    expect(AVAILABILITY_ORDER.map((key) => AVAILABILITY_META[key].label)).toEqual(['Available', 'Reserved', 'Rented / Leased', 'Sold'])
  })

  it('only accepts inquiries on available and reserved listings', () => {
    expect(acceptsInquiries('available')).toBe(true)
    expect(acceptsInquiries('reserved')).toBe(true)
    expect(acceptsInquiries('rented')).toBe(false)
    expect(acceptsInquiries('sold')).toBe(false)
  })

  it('renders the badge with its label and colour', () => {
    const wrapper = mount(AvailabilityBadge, { props: { availability: 'reserved' } })
    expect(wrapper.text()).toBe('Reserved')
    expect(wrapper.find('.status-badge__dot').attributes('style')).toContain(hexToRgb(TONE_COLORS.amber.solid))
  })

  it('renders a legend entry for every availability', () => {
    const wrapper = mount(StatusLegend, { props: { title: 'Availability:', items: legendItems(AVAILABILITY_META, AVAILABILITY_ORDER) } })
    expect(wrapper.findAll('li').map((item) => item.text())).toEqual(['Available', 'Reserved', 'Rented / Leased', 'Sold'])
  })

  it('shows review status, and availability once published', () => {
    const draft = mount(ListingStatusCell, { props: { listing: { status: 'Draft', availability: 'available', availabilityConfirmedAt: null } } })
    expect(draft.text()).toBe('Draft')

    const published = mount(ListingStatusCell, { props: { listing: { status: 'Approved', availability: 'sold', availabilityConfirmedAt: new Date().toISOString() } } })
    expect(published.text()).toContain('Published')
    expect(published.text()).toContain('Sold')

    const stale = mount(ListingStatusCell, { props: { listing: { status: 'Approved', availability: 'available', availabilityConfirmedAt: new Date(Date.now() - 50 * 86_400_000).toISOString() } } })
    expect(stale.get('[data-testid="review-status"]').text()).toBe('Needs confirmation')
  })

  it('sends the availability filter to the API', () => {
    expect(buildPropertySearchParams({ availability: 'available' }).get('availability')).toBe('available')
    expect(buildPropertySearchParams({ availability: '' }).has('availability')).toBe(false)
  })
})

function hexToRgb(hex: string): string {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgb(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255})`
}
