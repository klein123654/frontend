import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BrokerCredentialsFields from '../forms/BrokerCredentialsFields.vue'
import { credentialFormFrom, credentialPayload, emptyCredentialForm } from '@/services/brokerCredentials'

describe('BrokerCredentialsFields', () => {
  it('asks for both credentials, the firm and shows the DHSUD notice', () => {
    const wrapper = mount(BrokerCredentialsFields, { props: { modelValue: emptyCredentialForm(), dhsudNotice: 'We check DHSUD yearly.' } })

    for (const id of ['broker-license-number', 'broker-prc-valid-until', 'broker-dhsud-number', 'broker-dhsud-valid-until', 'broker-firm-name']) {
      expect(wrapper.get(`#${id}`).attributes()).toHaveProperty('required')
    }
    expect(wrapper.get('[data-testid="dhsud-notice"]').text()).toBe('We check DHSUD yearly.')
  })

  it('adds and removes affiliations', async () => {
    const form = emptyCredentialForm()
    const wrapper = mount(BrokerCredentialsFields, {
      props: { modelValue: form, suggestedAffiliations: ['Butuan Realty Board'], 'onUpdate:modelValue': () => undefined },
    })

    await wrapper.get('input[type="checkbox"]').setValue(true)
    expect(form.affiliations).toEqual(['Butuan Realty Board'])

    await wrapper.get('#broker-other-affiliation').setValue('Agusan Brokers Circle')
    await wrapper.get('button.add').trigger('click')
    expect(form.affiliations).toEqual(['Butuan Realty Board', 'Agusan Brokers Circle'])
  })

  it('converts between the API record and the form', () => {
    const form = credentialFormFrom({ license_number: 'PRC-1', prc_valid_until: '2028-01-31T00:00:00Z', affiliations: ['PAREB'] })
    expect(form.prcValidUntil).toBe('2028-01-31')
    form.firmName = '  Agusan Realty '
    form.affiliations.push(' ', 'PAREB')

    expect(credentialPayload(form)).toMatchObject({ license_number: 'PRC-1', firm_name: 'Agusan Realty', firm_position: null, affiliations: ['PAREB'] })
  })
})
