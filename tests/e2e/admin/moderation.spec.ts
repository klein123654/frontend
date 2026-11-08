import { expect, test } from '@playwright/test'
import type { ApiOverrides } from '../../fixtures/api-fixtures'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { application, inquiry, listing, pendingListing, report, users, verification } from '../../fixtures/test-data'
import { AdminPropertiesPage } from '../../pages/admin-properties.page'
import { AdminUsersPage } from '../../pages/admin-users.page'
import { AdminVerificationsPage } from '../../pages/admin-verifications.page'
import { AdminPublisherApplicationsPage } from '../../pages/admin-publisher-applications.page'
import { AdminInquiriesPage } from '../../pages/admin-inquiries.page'
import { AdminReportsPage } from '../../pages/admin-reports.page'

async function openAdmin(page: import('@playwright/test').Page, path: string, overrides: ApiOverrides = {}) {
  await installApiMocks(page, 'admin', overrides)
  await seedAuthenticatedRole(page, 'admin')
  await page.goto(path)
  await waitForRouteReady(page)
}

test('admin dashboard opens moderation queues', async ({ page }) => {
  await openAdmin(page, '/admin/dashboard')
  await expect(page.getByRole('heading', { name: /dashboard overview/i })).toBeVisible()
})

test('admin dashboard has no axe violations', async ({ page }) => {
  await openAdmin(page, '/admin/dashboard')
  await expectNoAxeViolations(page)
})

test('admin can search, filter, inspect, and approve a property listing', async ({ page }) => {
  let decisionSent = false
  await openAdmin(page, '/admin/properties')
  await page.route(`**/api/admin/properties/${pendingListing.id}`, async (route) => {
    decisionSent = route.request().method() === 'PATCH'
    await route.fulfill({ json: { data: { ...pendingListing, status: 'published' } } })
  })
  const properties = new AdminPropertiesPage(page)
  await properties.searchInput.fill(pendingListing.title)
  await properties.statusFilter.selectOption('Pending')
  await expect(page.getByRole('button', { name: `Review ${pendingListing.title}` })).toBeVisible()
  await properties.review(pendingListing.title)
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: /approve listing/i }).click()
  await expect(page.getByRole('status')).toContainText(/listing approved/i)
  expect(decisionSent).toBe(true)
})

test('admin requires a reason to reject a listing', async ({ page }) => {
  await openAdmin(page, '/admin/properties')
  await page.getByRole('button', { name: `Review ${pendingListing.title}` }).click()
  await page.getByRole('button', { name: /reject listing/i }).click()
  await expect(page.getByRole('status')).toContainText(/rejection reason is required/i)
  await page.getByLabel(/review note/i).fill('Missing ownership documentation.')
  await page.getByRole('button', { name: /reject listing/i }).click()
  await expect(page.getByRole('status')).toContainText(/listing rejected/i)
})

test('admin can suspend a user from the filtered user directory', async ({ page }) => {
  await openAdmin(page, '/admin/users')
  const adminUsers = new AdminUsersPage(page)
  await adminUsers.searchInput.fill(users.buyer.name)
  await adminUsers.roleFilter.selectOption('Client')
  await expect(page.getByRole('button', { name: `Suspend ${users.buyer.name}` })).toBeVisible()
  await adminUsers.accountAction('Suspend', users.buyer.name)
  await expect(page.getByRole('status')).toContainText(/user status saved/i)
})

test('admin can review and verify broker credentials', async ({ page }) => {
  await openAdmin(page, '/admin/verifications')
  const queue = new AdminVerificationsPage(page)
  await queue.searchInput.fill(users.broker.name)
  await queue.statusFilter.selectOption('Pending')
  await queue.reviewButton.click()
  await expect(page.getByRole('heading', { name: /verification details/i })).toBeVisible()
  await page.getByRole('button', { name: /mark verified/i }).click()
  await expect(page.getByRole('status')).toContainText(/verification verified/i)
  expect(verification.id).toBe(301)
})

test('admin requires a note to reject a publisher application', async ({ page }) => {
  await openAdmin(page, '/admin/publisher-applications', {
    'PATCH admin/publisher-applications/401': { scenario: 'success', body: { data: { ...application, status: 'rejected', review_notes: 'Incomplete business details.' } } },
  })
  const queue = new AdminPublisherApplicationsPage(page)
  await queue.statusFilter.selectOption('pending')
  await queue.reviewButton.click()
  await page.getByRole('button', { name: /reject request/i }).click()
  await expect(page.getByRole('status')).toContainText(/review note/i)
  await page.getByLabel(/review note/i).fill('Incomplete business details.')
  await page.getByRole('button', { name: /reject request/i }).click()
  await expect(page.getByRole('status')).toContainText(/application rejected/i)
})

test('admin can inspect and update an inquiry status', async ({ page }) => {
  let actualEndpoint = ''
  await openAdmin(page, '/admin/inquiries')
  await page.route(`**/api/inquiries/${inquiry.id}`, async (route) => {
    actualEndpoint = new URL(route.request().url()).pathname
    await route.fulfill({ json: { data: { ...inquiry, status: 'resolved' } } })
  })
  const queue = new AdminInquiriesPage(page)
  await queue.searchInput.fill(users.buyer.name)
  await queue.statusFilter.selectOption('In Progress')
  await queue.openInquiry(inquiry.id)
  await page.getByRole('region', { name: 'Selected admin inquiry' }).getByLabel('Inquiry Status', { exact: true }).selectOption('Resolved')
  await expect(page.getByRole('status')).toContainText(/status saved/i)
  expect(actualEndpoint).toBe(`/api/inquiries/${inquiry.id}`)
})

test('admin can inspect and resolve an issue report', async ({ page }) => {
  await openAdmin(page, '/admin/reports')
  const queue = new AdminReportsPage(page)
  await queue.searchInput.fill('Header overlaps')
  await queue.statusFilter.selectOption('New')
  await queue.openReport(report.id)
  await page.getByRole('region', { name: 'Selected bug report' }).getByLabel('Report Status', { exact: true }).selectOption('Resolved')
  await expect(page.getByRole('status')).toContainText(/report status saved/i)
})

test('admin queues expose empty and API error states', async ({ page }) => {
  await openAdmin(page, '/admin/users', { 'GET admin/users': 'empty' })
  await expect(page.getByText(/no accounts match/i)).toBeVisible()
  await page.unrouteAll()
  await openAdmin(page, '/admin/reports', { 'GET admin/reports': 'error' })
  await expect(page.getByRole('alert')).toBeVisible()
  expect(listing.id).toBe(101)
})