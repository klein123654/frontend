#!/usr/bin/env node
/**
 * Post-build step: writes an indexable HTML file for every published property
 * and a sitemap.xml, so search engines and link previews see real content
 * instead of an empty <div id="app">.
 *
 * Cloudflare Pages serves dist/properties/12.html for /properties/12. The Vue
 * app still boots normally and replaces the pre-rendered markup on mount.
 *
 * If the API cannot be reached (for example while the backend is asleep), the
 * build still succeeds with a sitemap of the static pages only.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const SITE_URL = (process.env.SITE_URL || 'https://frontend-1cf.pages.dev').replace(/\/+$/, '')
const API_BASE_URL = (process.env.VITE_API_BASE_URL || 'https://backend1-3fwi.onrender.com/api').replace(/\/+$/, '')
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '')
const REQUEST_TIMEOUT_MS = 90_000
const MAX_PAGES = 40

const STATIC_PATHS = ['/', '/properties', '/report-issue', '/login', '/register']
const LISTING_LABELS = { rent: 'For Rent', lease: 'For Lease', sale: 'For Sale' }

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function truncate(text, length) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  return clean.length > length ? `${clean.slice(0, length - 1).trimEnd()}…` : clean
}

function formatPeso(amount) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(amount)
}

function imageUrl(path) {
  // Skip records whose stored path has no file name (e.g. ".../property-images/").
  if (!path || path.endsWith('/')) return ''
  if (/^https?:\/\//i.test(path)) return path
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`${url} returned HTTP ${response.status}`)
  return response.json()
}

async function fetchPublishedProperties() {
  const properties = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const body = await fetchJson(`${API_BASE_URL}/properties?per_page=50&page=${page}`)
    properties.push(...(body.data ?? []))
    if (!body.meta || page >= body.meta.last_page) break
  }
  return properties
}

export function describePublisher(publisher) {
  if (!publisher) return null
  const credential = publisher.role === 'broker'
    ? `PRC-licensed broker${publisher.license_number ? ` (License ${publisher.license_number})` : ''}`
    : publisher.role === 'developer' ? 'Verified developer' : 'Verified owner'
  return {
    url: `${SITE_URL}/publishers/${publisher.id}`,
    name: publisher.name,
    line: `${publisher.name}${publisher.agency_name ? `, ${publisher.agency_name}` : ''} · ${publisher.verified ? credential : publisher.role_label}`,
    phone: publisher.contact?.phone ?? null,
  }
}

export function describeProperty(property) {
  const listingLabel = LISTING_LABELS[property.listing_type] ?? 'For Sale'
  const location = [property.address_line, property.barangay, property.city, property.province]
    .filter((part) => part && String(part).trim())
    .join(', ') || 'Butuan City'
  const price = Number(property.price) > 0 ? formatPeso(Number(property.price)) : 'Contact for pricing'
  const images = [...(property.images ?? [])]
    .sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)) || (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((image) => imageUrl(image.path))
    .filter(Boolean)

  return {
    url: `${SITE_URL}/properties/${property.id}`,
    title: `${property.title} – ${listingLabel} in ${property.city || 'Butuan City'} | ButuanSpaces`,
    description: truncate(`${listingLabel} · ${price} · ${location}. ${property.description ?? ''}`, 160),
    heading: property.title,
    listingLabel,
    location,
    price,
    image: images[0] ?? '',
    body: truncate(property.description, 1200),
    publisher: describePublisher(property.publisher),
    area: Number(property.floor_area ?? property.lot_area ?? 0),
  }
}

export function renderPropertyPage(template, property) {
  const page = describeProperty(property)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: page.body,
    url: page.url,
    ...(page.image ? { image: page.image } : {}),
    ...(property.published_at ? { datePosted: property.published_at } : {}),
    ...(Number(property.price) > 0
      ? { offers: { '@type': 'Offer', price: Number(property.price), priceCurrency: property.currency || 'PHP' } }
      : {}),
  }

  const head = [
    `<title>${escapeHtml(page.title)}</title>`,
    `<meta name="description" content="${escapeHtml(page.description)}">`,
    `<link rel="canonical" href="${escapeHtml(page.url)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="ButuanSpaces">`,
    `<meta property="og:title" content="${escapeHtml(page.title)}">`,
    `<meta property="og:description" content="${escapeHtml(page.description)}">`,
    `<meta property="og:url" content="${escapeHtml(page.url)}">`,
    page.image ? `<meta property="og:image" content="${escapeHtml(page.image)}">` : '',
    `<meta name="twitter:card" content="${page.image ? 'summary_large_image' : 'summary'}">`,
    `<meta name="twitter:title" content="${escapeHtml(page.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}">`,
    `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}</script>`,
  ].filter(Boolean).join('\n    ')

  const content = `
      <main>
        <p><a href="/properties">← All properties</a></p>
        <h1>${escapeHtml(page.heading)}</h1>
        <p><strong>${escapeHtml(page.listingLabel)}</strong> · ${escapeHtml(page.price)}</p>
        <p>${escapeHtml(page.location)}</p>
        ${page.area > 0 ? `<p>Floor area: ${escapeHtml(page.area.toLocaleString('en-PH'))} sq. m.</p>` : ''}
        ${page.image ? `<img src="${escapeHtml(page.image)}" alt="${escapeHtml(page.heading)}" width="800" height="500" loading="lazy">` : ''}
        <p>${escapeHtml(page.body)}</p>
        ${page.publisher ? `<p>Listed by <a href="${escapeHtml(page.publisher.url)}">${escapeHtml(page.publisher.line)}</a>${page.publisher.phone ? ` · <a href="tel:${escapeHtml(page.publisher.phone)}">${escapeHtml(page.publisher.phone)}</a>` : ''}</p>` : ''}
      </main>`

  return template
    // Replace the generic head tags with the property's own.
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace(/\s*<meta (name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>/g, '')
    .replace(/\s*<link rel="canonical"[^>]*>/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<!--app-prerender-->', content)
}

export function renderSitemap(propertyEntries) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    ...STATIC_PATHS.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: today })),
    ...propertyEntries.map((property) => ({
      loc: `${SITE_URL}/properties/${property.id}`,
      lastmod: String(property.updated_at || property.published_at || today).slice(0, 10),
    })),
    ...[...new Set(propertyEntries.map((property) => property.publisher?.id).filter(Boolean))].map((id) => ({
      loc: `${SITE_URL}/publishers/${id}`,
      lastmod: today,
    })),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${escapeHtml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
}

async function main() {
  const template = await readFile(join(DIST_DIR, 'index.html'), 'utf8')
  let properties = []

  try {
    properties = await fetchPublishedProperties()
  } catch (error) {
    console.warn(`[prerender] Skipping property pages: ${error instanceof Error ? error.message : error}`)
  }

  await mkdir(join(DIST_DIR, 'properties'), { recursive: true })
  for (const property of properties) {
    await writeFile(join(DIST_DIR, 'properties', `${property.id}.html`), renderPropertyPage(template, property))
  }

  await writeFile(join(DIST_DIR, 'sitemap.xml'), renderSitemap(properties))
  console.log(`[prerender] Wrote ${properties.length} property pages and sitemap.xml`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
