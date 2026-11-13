export const SITE_NAME = 'ButuanSpaces'
export const DEFAULT_DESCRIPTION =
  'Find offices, retail spaces, warehouses and commercial lots for rent, lease or sale in Butuan City. Contact owners and PRC-licensed brokers directly on ButuanSpaces.'

/** Browser tab titles for each named route. Routes not listed use the site name alone. */
export const ROUTE_TITLES: Record<string, string> = {
  home: 'Commercial Property in Butuan City',
  properties: 'Browse Properties',
  'property-details': 'Property Details',
  'report-issue': 'Report an Issue',
  'publisher-profile': 'Publisher Profile',
  login: 'Sign In',
  register: 'Create an Account',
  'forgot-password': 'Forgot Password',
  'reset-password': 'Reset Password',
  'buyer-saved-properties': 'Saved Properties',
  'buyer-inquiries': 'My Inquiries',
  'publisher-application': 'Become a Publisher',
  'owner-dashboard': 'Owner Dashboard',
  'owner-properties': 'My Properties',
  'owner-create-property': 'New Listing',
  'owner-edit-property': 'Edit Listing',
  'owner-property-details': 'Listing Details',
  'owner-inquiries': 'Inquiries',
  'owner-profile': 'Public Profile',
  'developer-profile': 'Public Profile',
  'developer-dashboard': 'Developer Dashboard',
  'developer-properties': 'My Properties',
  'developer-create-property': 'New Listing',
  'developer-edit-property': 'Edit Listing',
  'developer-property-details': 'Listing Details',
  'developer-inquiries': 'Inquiries',
  'broker-dashboard': 'Broker Dashboard',
  'broker-listings': 'My Listings',
  'broker-create-listing': 'New Listing',
  'broker-edit-listing': 'Edit Listing',
  'broker-listing-details': 'Listing Details',
  'broker-inquiries': 'Inquiries',
  'broker-profile': 'Broker Profile',
  'admin-dashboard': 'Admin Dashboard',
  'admin-properties': 'Listing Review',
  'admin-users': 'Users',
  'admin-verifications': 'Broker Verifications',
  'admin-publisher-applications': 'Publisher Applications',
  'admin-inquiries': 'All Inquiries',
  'admin-reports': 'Issue Reports',
  'not-found': 'Page Not Found',
  account: 'Account Settings',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  about: 'About & FAQ',
}

export function formatPageTitle(pageTitle?: string | null): string {
  return pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME
}

export function titleForRoute(routeName: unknown): string {
  return formatPageTitle(typeof routeName === 'string' ? ROUTE_TITLES[routeName] : undefined)
}

/** Set the tab title and meta description, e.g. after a property has loaded. */
export function setPageMeta(pageTitle: string, description: string = DEFAULT_DESCRIPTION): void {
  if (typeof document === 'undefined') return
  document.title = formatPageTitle(pageTitle)
  let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
  if (!descriptionTag) {
    descriptionTag = document.createElement('meta')
    descriptionTag.name = 'description'
    document.head.append(descriptionTag)
  }
  descriptionTag.content = description.replace(/\s+/g, ' ').trim().slice(0, 160)
}

/** Pages that search engines should index; everything else is an app screen. */
const INDEXABLE_ROUTES = new Set(['home', 'properties', 'property-details', 'publisher-profile', 'report-issue', 'about', 'privacy', 'terms'])

/**
 * Point the canonical link and og:url at the current page (without its query
 * string), so search engines don't treat every page as a copy of the homepage.
 */
export function setCanonicalUrl(routeName: unknown, path: string, origin: string): void {
  if (typeof document === 'undefined') return
  const url = typeof routeName === 'string' && INDEXABLE_ROUTES.has(routeName) ? `${origin}${path}` : `${origin}/`

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.append(canonical)
  }
  canonical.href = url

  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', url)
}
