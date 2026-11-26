import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AiDescriptionAssistant from '../forms/AiDescriptionAssistant.vue'
import * as service from '@/services/propertyService'

const facts = { title: 'Corner office', area: 120, location: 'J.C. Aquino Ave, Butuan City', price: 45000, propertyType: 'Office Spaces', listingType: 'For Rent' }

function render(description = '') {
  const state = { description, features: '' }
  const wrapper = mount(AiDescriptionAssistant, {
    props: {
      facts,
      modelValue: state.description,
      'onUpdate:modelValue': (value: string) => { state.description = value; void wrapper.setProps({ modelValue: value }) },
      features: state.features,
      'onUpdate:features': (value: string) => { state.features = value; void wrapper.setProps({ features: value }) },
    },
  })
  return { wrapper, state }
}

describe('AiDescriptionAssistant', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('sends the key features and language, and shows the draft', async () => {
    const spy = vi.spyOn(service, 'generateListingDescription').mockResolvedValue({ description: 'A bright office.', unsupportedNumbers: [] })
    const { wrapper, state } = render()

    await wrapper.get('textarea').setValue('2 parking slots')
    await wrapper.get('select').setValue('ceb')
    await wrapper.get('button.ai-assist__primary').trigger('click')
    await flushPromises()

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ ...facts, features: '2 parking slots', language: 'ceb', style: 'standard', currentDescription: undefined }))
    expect(state.description).toBe('A bright office.')
    expect(wrapper.text()).toContain('Review the draft before saving')
  })

  it('asks before replacing text the publisher already wrote, and can polish it', async () => {
    const spy = vi.spyOn(service, 'generateListingDescription').mockResolvedValue({ description: 'Polished text.', unsupportedNumbers: [] })
    const { wrapper } = render('my own notes about the office')

    await wrapper.get('button.ai-assist__primary').trigger('click')
    expect(spy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('already has text')

    await wrapper.findAll('.ai-assist__ask button').find((b) => b.text() === 'Improve my text')!.trigger('click')
    await flushPromises()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ currentDescription: 'my own notes about the office' }))
  })

  it('offers restyling after a draft and warns about numbers the publisher never gave', async () => {
    const spy = vi.spyOn(service, 'generateListingDescription')
      .mockResolvedValueOnce({ description: 'Office with 15 parking slots.', unsupportedNumbers: ['15'] })
      .mockResolvedValueOnce({ description: 'Short office text.', unsupportedNumbers: [] })
    const { wrapper } = render()

    await wrapper.get('button.ai-assist__primary').trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-testid="ai-unsupported-numbers"]').text()).toContain('15')

    await wrapper.findAll('.ai-assist__styles button').find((b) => b.text() === 'Shorter')!.trigger('click')
    await flushPromises()
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ style: 'shorter', currentDescription: 'Office with 15 parking slots.' }))
    expect(wrapper.find('[data-testid="ai-unsupported-numbers"]').exists()).toBe(false)
  })

  it('shows the service message when the AI is unavailable', async () => {
    vi.spyOn(service, 'generateListingDescription').mockRejectedValue(new Error('AI features are not available right now.'))
    const { wrapper, state } = render()

    await wrapper.get('button.ai-assist__primary').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('AI features are not available right now.')
    expect(state.description).toBe('')
  })
})
