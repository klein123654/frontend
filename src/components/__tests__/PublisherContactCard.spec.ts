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
  broker: {
    licenseNumber: 'PRC-0012345',
    prcValidUntil: '2028-05-31',
    dhsudRegistrationNumber: 'DHSUD-CRG-0099',
    dhsudValidUntil: '2027-06-30',
    credentialStatus: 'current',
    firm: { name: 'Agusan Realty', position: 'Managing Broker', address: 'Montilla Blvd, Butuan City', registrationNumber: null },
    affiliations: ['Butuan Realty Board', 'PAREB'],
  },
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

    expect(wrapper.text()).toContain('Verified broker')
    expect(wrapper.text()).toContain('PRC PRC-0012345')
    expect(wrapper.get('a[href="tel:09171234567"]').text()).toContain('Call 09171234567')
    expect(wrapper.get('a[href="https://m.me/ana.reyes"]').attributes('rel')).toContain('noopener')
    expect(wrapper.get('a[href^="mailto:ana@example.test"]').attributes('href')).toContain('subject=Inquiry%3A%20Corner%20Office')
    expect(wrapper.find('a[href^="viber:"]').exists()).toBe(false)
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/publishers/5')
  })

  it('shows the broker’s firm, both credentials and affiliations', () => {
    const wrapper = render(broker)

    expect(wrapper.get('[data-testid="broker-firm"]').text()).toContain('Agusan Realty')
    expect(wrapper.get('[data-testid="broker-firm"]').text()).toContain('Managing Broker')
    const credentials = wrapper.get('[data-testid="broker-credentials"]').text()
    expect(credentials).toContain('DHSUD-CRG-0099')
    expect(credentials).toContain('valid until Jun 30, 2027')
    expect(wrapper.findAll('.credentials__affiliations li').map((item) => item.text())).toEqual(['Butuan Realty Board', 'PAREB'])
  })

  it('notes when a broker’s registration is being renewed', () => {
    const wrapper = render({ ...broker, verified: false, broker: { ...broker.broker!, credentialStatus: 'expired' } })

    expect(wrapper.text()).toContain('Registration being renewed')
    expect(wrapper.find('.credentials__lapsed').exists()).toBe(true)
  })

  it('says owner listings have no broker', () => {
    const wrapper = render({ ...broker, role: 'owner', roleLabel: 'Property owner', licenseNumber: null, agencyName: null, broker: null })

    expect(wrapper.get('[data-testid="owner-direct"]').text()).toContain('No broker is involved')
  })

  it('points to the message form when no contact details are public', () => {
    const wrapper = render({ ...broker, contact: { phone: null, email: null, messengerUrl: null, viberUrl: null } })

    expect(wrapper.text()).toContain('Send a message with the form below')
    expect(wrapper.find('a[href^="tel:"]').exists()).toBe(false)
  })
})
