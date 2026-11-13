import type { AppRole } from '../fixtures/test-data'
import type { Page } from '@playwright/test'

export async function waitForRouteReady(page: Page, landmark?: string) {
  const heading = page.getByRole('heading', {
    level: 1,
    ...(landmark ? { name: new RegExp(landmark, 'i') } : {}),
  })
  await heading.first().waitFor({ state: 'visible', timeout: 15_000 })
}

export interface RouteCase {
  path: string
  guard: AppRole | null
  roles: AppRole[]
  redirectTo?: string
  landmark: string
}

export const ROUTES: RouteCase[] = [
  { path: '/', guard: null, roles: [], landmark: 'Make room for what your business does next.' },
  { path: '/properties', guard: null, roles: [], landmark: 'Explore Commercial Properties' },
  { path: '/properties/101', guard: null, roles: [], landmark: 'Riverside Commercial Space' },
  { path: '/report-issue', guard: null, roles: [], landmark: 'Report an Issue' },
  { path: '/login', guard: null, roles: [], landmark: 'Your space. Your opportunity.' },
  { path: '/register', guard: null, roles: [], landmark: 'Create your account' },
  { path: '/forgot-password', guard: null, roles: [], landmark: "Let's get you back on track." },
  { path: '/reset-password?token=reset-token&email=buyer%40example.test', guard: null, roles: [], landmark: 'Set a new password' },
  { path: '/buyer/dashboard', guard: null, roles: [], redirectTo: '/', landmark: 'Make room for what your business does next.' },
  { path: '/buyer/properties', guard: null, roles: [], redirectTo: '/properties', landmark: 'Explore Commercial Properties' },
  { path: '/buyer/properties/101', guard: null, roles: [], redirectTo: '/properties/101', landmark: 'Riverside Commercial Space' },
  { path: '/buyer/saved-properties', guard: 'buyer', roles: ['buyer'], landmark: 'Saved Properties' },
  { path: '/buyer/inquiries', guard: 'buyer', roles: ['buyer'], landmark: 'My Inquiries' },
  { path: '/publisher/apply', guard: 'buyer', roles: ['buyer'], landmark: 'List a property' },
  { path: '/owner/dashboard', guard: 'owner', roles: ['owner'], landmark: 'Dashboard Overview' },
  { path: '/owner/properties', guard: 'owner', roles: ['owner'], landmark: 'My Properties' },
  { path: '/owner/properties/create', guard: 'owner', roles: ['owner'], landmark: 'Add New Property' },
  { path: '/owner/properties/103/edit', guard: 'owner', roles: ['owner'], landmark: 'Edit Property' },
  { path: '/owner/properties/103', guard: 'owner', roles: ['owner'], landmark: 'Property Details' },
  { path: '/owner/inquiries', guard: 'owner', roles: ['owner'], landmark: 'Owner Inquiries' },
  { path: '/developer/dashboard', guard: 'developer', roles: ['developer'], landmark: 'Dashboard Overview' },
  { path: '/developer/properties', guard: 'developer', roles: ['developer'], landmark: 'My Properties' },
  { path: '/developer/properties/create', guard: 'developer', roles: ['developer'], landmark: 'Add New Property' },
  { path: '/developer/properties/103/edit', guard: 'developer', roles: ['developer'], landmark: 'Edit Property' },
  { path: '/developer/properties/103', guard: 'developer', roles: ['developer'], landmark: 'Property Details' },
  { path: '/developer/inquiries', guard: 'developer', roles: ['developer'], landmark: 'Owner Inquiries' },
  { path: '/broker/dashboard', guard: 'broker', roles: ['broker'], landmark: 'Dashboard Overview' },
  { path: '/broker/listings', guard: 'broker', roles: ['broker'], landmark: 'My Listings' },
  { path: '/broker/listings/create', guard: 'broker', roles: ['broker'], landmark: 'Add New Listing' },
  { path: '/broker/listings/701/edit', guard: 'broker', roles: ['broker'], landmark: 'Edit Listing' },
  { path: '/broker/listings/701', guard: 'broker', roles: ['broker'], landmark: 'Listing Details' },
  { path: '/broker/inquiries', guard: 'broker', roles: ['broker'], landmark: 'Broker Inquiries' },
  { path: '/broker/profile', guard: 'broker', roles: ['broker'], landmark: 'Broker Profile' },
  { path: '/admin/dashboard', guard: 'admin', roles: ['admin'], landmark: 'Dashboard Overview' },
  { path: '/admin/properties', guard: 'admin', roles: ['admin'], landmark: 'Property Approvals' },
  { path: '/admin/users', guard: 'admin', roles: ['admin'], landmark: 'User Management' },
  { path: '/admin/verifications', guard: 'admin', roles: ['admin'], landmark: 'Broker Verification' },
  { path: '/admin/publisher-applications', guard: 'admin', roles: ['admin'], landmark: 'Publisher Applications' },
  { path: '/admin/inquiries', guard: 'admin', roles: ['admin'], landmark: 'Inquiries Management' },
  { path: '/admin/reports', guard: 'admin', roles: ['admin'], landmark: 'Issue Reports' },
  { path: '/account', guard: 'buyer', roles: ['buyer', 'owner', 'broker', 'admin'], landmark: 'Account settings' },
  { path: '/privacy', guard: null, roles: [], landmark: 'Privacy Policy' },
  { path: '/terms', guard: null, roles: [], landmark: 'Terms of Use' },
  { path: '/about', guard: null, roles: [], landmark: 'About ButuanSpaces' },
]
