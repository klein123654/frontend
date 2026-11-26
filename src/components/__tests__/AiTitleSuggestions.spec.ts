import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AiTitleSuggestions from '../forms/AiTitleSuggestions.vue'
import * as service from '@/services/propertyService'

const facts = { title: '', area: 85, location: 'Montilla Blvd, Libertad', price: 38000, propertyType: 'Retail Spaces', listingType: 'For Rent', features: 'corner unit' }

describe('AiTitleSuggestions', () => {
  it('lists suggestions and emits the one picked', async () => {
    vi.spyOn(service, 'suggestListingTitles').mockResolvedValue(['Corner Retail Unit on Montilla', 'Glass-Front Shop in Libertad'])
    const wrapper = mount(AiTitleSuggestions, { props: { facts } })

    await wrapper.get('button').trigger('click')
    await flushPromises()
    const options = wrapper.findAll('.ai-titles__list button')
    expect(options.map((b) => b.text())).toEqual(['Corner Retail Unit on Montilla', 'Glass-Front Shop in Libertad'])

    await options[1]!.trigger('click')
    expect(wrapper.emitted('pick')).toEqual([['Glass-Front Shop in Libertad']])
    expect(wrapper.findAll('.ai-titles__list button')).toHaveLength(0)
  })
})
