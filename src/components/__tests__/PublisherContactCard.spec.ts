import { describe, expect, it } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import PublisherContactCard from '../publisher/PublisherContactCard.vue'
import type { Publisher } from '@/types/property'

const broker: Publisher = {
  id: 5,
  name: 'Ana Reyes',
  role: 'broker',
  roleLabel: 'Licensed broker',
  verified: true,
  licenseNumber: 'PRC-0012345',
  agencyName: 'Agusan Realty',
  memberSince: '2026-10-01',
  contact: { phone: '09171234567', email: 'ana@example.test', messengerUrl: 'https://m.me/ana.reyes', viberUrl: null },
}

function render(publisher: Publisher) {
  return mount(PublisherContactCard, {
    props: { publisher, propertyTitle: 'Corner Office' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('PublisherContactCard', () => {
  it('shows the verified licence and direct contact links', () => {
    const wrapper = render(broker)

    expect(wrapper.text()).toContain('PRC-licensed broker')
    expect(wrapper.text()).toContain('License PRC-0012345')
    expect(wrapper.get('a[href="tel:09171234567"]').text()).toContain('Call 09171234567')
    expect(wrapper.get('a[href="https://m.me/ana.reyes"]').attributes('rel')).toContain('noopener')
    expect(wrapper.get('a[href^="mailto:ana@example.test"]').attributes('href')).toContain('subject=Inquiry%3A%20Corner%20Office')
    expect(wrapper.find('a[href^="viber:"]').exists()).toBe(false)
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/publishers/5')
  })

  it('points to the message form when no contact details are public', () => {
    const wrapper = render({ ...broker, contact: { phone: null, email: null, messengerUrl: null, viberUrl: null } })

    expect(wrapper.text()).toContain('Send a message with the form below')
    expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false)
  })
})
