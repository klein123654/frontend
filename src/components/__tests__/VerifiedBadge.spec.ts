import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VerifiedBadge from '../publisher/VerifiedBadge.vue'

describe('VerifiedBadge', () => {
  it('labels owners', () => {
    expect(mount(VerifiedBadge, { props: { publisher: { verified: true, role: 'owner', licenseNumber: null } } }).text()).toBe('Verified owner')
  })

  it('shows the PRC licence for verified brokers except in compact mode', () => {
    const publisher = { verified: true, role: 'broker' as const, licenseNumber: 'PRC-1' }
    expect(mount(VerifiedBadge, { props: { publisher } }).text()).toBe('Verified broker · PRC PRC-1')
    expect(mount(VerifiedBadge, { props: { publisher, compact: true } }).text()).toBe('Verified broker')
  })

  it('warns when a broker’s credentials have expired', () => {
    const broker = { licenseNumber: 'PRC-1', prcValidUntil: '2027-01-01', dhsudRegistrationNumber: 'D-1', dhsudValidUntil: '2026-01-01', credentialStatus: 'expired' as const, firm: null, affiliations: [] }
    const wrapper = mount(VerifiedBadge, { props: { publisher: { verified: false, role: 'broker', licenseNumber: 'PRC-1', broker } } })
    expect(wrapper.text()).toBe('Registration being renewed')
    expect(wrapper.classes()).toContain('verified-badge--renewing')
  })

  it('renders nothing for unverified publishers', () => {
    expect(mount(VerifiedBadge, { props: { publisher: { verified: false, role: 'broker', licenseNumber: null } } }).html()).toBe('<!--v-if-->')
  })
})
