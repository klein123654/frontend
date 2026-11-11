import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VerifiedBadge from '../publisher/VerifiedBadge.vue'

describe('VerifiedBadge', () => {
  it('labels owners and developers', () => {
    expect(mount(VerifiedBadge, { props: { publisher: { verified: true, role: 'owner', licenseNumber: null } } }).text()).toBe('Verified owner')
    expect(mount(VerifiedBadge, { props: { publisher: { verified: true, role: 'developer', licenseNumber: null } } }).text()).toBe('Verified developer')
  })

  it('shows the PRC licence for brokers except in compact mode', () => {
    const publisher = { verified: true, role: 'broker' as const, licenseNumber: 'PRC-1' }
    expect(mount(VerifiedBadge, { props: { publisher } }).text()).toContain('License PRC-1')
    expect(mount(VerifiedBadge, { props: { publisher, compact: true } }).text()).not.toContain('License')
  })

  it('renders nothing for unverified publishers', () => {
    expect(mount(VerifiedBadge, { props: { publisher: { verified: false, role: 'broker', licenseNumber: null } } }).html()).toBe('<!--v-if-->')
  })
})
