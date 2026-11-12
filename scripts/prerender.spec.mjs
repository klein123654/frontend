import { describe, expect, it } from 'vitest'
import { escapeHtml, renderPropertyPage, renderSitemap } from './prerender.mjs'

const template = `<!DOCTYPE html><html lang="en"><head>
<title>ButuanSpaces</title>
<meta name="description" content="generic">
<meta property="og:title" content="generic">
<link rel="canonical" href="https://butuanspaces.pages.dev/">
</head><body><div id="app"><!--app-prerender--></div></body></html>`

const property = {
  id: 12,
  title: 'Corner <Lot>',
  listing_type: 'sale',
  description: 'A "prime" corner lot.',
  price: '2500000',
  currency: 'PHP',
  city: 'Butuan City',
  barangay: 'Libertad',
  images: [{ path: 'https://cdn.example.test/lot.jpg', is_primary: true }],
  updated_at: '2026-11-01T00:00:00Z',
  publisher: { id: 5, name: 'Ana Reyes', role: 'broker', role_label: 'Licensed broker', verified: true, license_number: 'PRC-0012345', agency_name: 'Agusan Realty', contact: { phone: '09171234567' } },
}

describe('prerender', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;')
  })

  it('replaces the generic head tags with property-specific ones', () => {
    const html = renderPropertyPage(template, property)

    expect(html.match(/<title>/g)).toHaveLength(1)
    expect(html).toContain('<title>Corner &lt;Lot&gt; – For Sale in Butuan City | ButuanSpaces</title>')
    expect(html).toContain('href="https://butuanspaces.pages.dev/properties/12"')
    expect(html).toContain('og:image" content="https://cdn.example.test/lot.jpg"')
    expect(html).not.toContain('content="generic"')
  })

  it('renders readable content and structured data into the app container', () => {
    const html = renderPropertyPage(template, property)

    expect(html).toContain('<h1>Corner &lt;Lot&gt;</h1>')
    expect(html).toContain('₱2,500,000')
    expect(html).toContain('"@type":"RealEstateListing"')
    expect(html).not.toContain('<!--app-prerender-->')
  })

  it('shows the verified publisher with a link to their profile', () => {
    const html = renderPropertyPage(template, property)

    expect(html).toContain('href="https://butuanspaces.pages.dev/publishers/5">Ana Reyes, Agusan Realty · PRC-licensed broker (License PRC-0012345)</a>')
    expect(html).toContain('href="tel:09171234567"')
  })

  it('lists static pages and every property in the sitemap', () => {
    const xml = renderSitemap([property])

    expect(xml).toContain('<loc>https://butuanspaces.pages.dev/properties</loc>')
    expect(xml).toContain('<loc>https://butuanspaces.pages.dev/properties/12</loc><lastmod>2026-11-01</lastmod>')
    expect(xml).toContain('<loc>https://butuanspaces.pages.dev/publishers/5</loc>')
  })
})
