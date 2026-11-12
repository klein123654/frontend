import { afterEach, describe, expect, it } from 'vitest'
import { formatPageTitle, setPageMeta, titleForRoute } from '../pageMeta'

describe('page titles', () => {
  it('appends the site name to a page title', () => {
    expect(formatPageTitle('Browse Properties')).toBe('Browse Properties | ButuanSpaces')
  })

  it('uses the site name alone when there is no page title', () => {
    expect(formatPageTitle()).toBe('ButuanSpaces')
    expect(titleForRoute('unknown-route')).toBe('ButuanSpaces')
    expect(titleForRoute(undefined)).toBe('ButuanSpaces')
  })

  it('looks up titles by route name', () => {
    expect(titleForRoute('login')).toBe('Sign In | ButuanSpaces')
  })
})

describe('setPageMeta', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    document.title = ''
  })

  it('sets the title and a trimmed meta description', () => {
    setPageMeta('Warehouse in Libertad', `A   large\nwarehouse ${'x'.repeat(200)}`)

    expect(document.title).toBe('Warehouse in Libertad | ButuanSpaces')
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    expect(description?.content.startsWith('A large warehouse')).toBe(true)
    expect(description?.content.length).toBe(160)
  })

  it('updates an existing description tag instead of adding another', () => {
    document.head.innerHTML = '<meta name="description" content="old">'
    setPageMeta('Page', 'New description')

    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).toBe('New description')
  })
})
