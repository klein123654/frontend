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

test('admin can permanently delete any listing', async ({ page }) => {
  let deleteSent = false
  await openAdmin(page, '/admin/properties')
  await page.route(`**/api/admin/properties/${listing.id}`, async (route) => {
    deleteSent = route.request().method() === 'DELETE'
    await route.fulfill({ json: { message: 'Listing deleted.' } })
  })
  page.once('dialog', (dialog) => void dialog.accept())
  await page.getByRole('button', { name: `Review ${listing.title}` }).click()
  await page.getByRole('button', { name: /delete listing/i }).click()
  await expect(page.getByRole('status').filter({ hasText: /was deleted/i })).toBeVisible()
  expect(deleteSent).toBe(true)
  await expect(page.getByRole('button', { name: `Review ${listing.title}` })).toHaveCount(0)
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

test('admin can delete a test account after confirming with their password', async ({ page }) => {
  await openAdmin(page, '/admin/users')
  await page.getByRole('button', { name: `Delete ${users.buyer.name}` }).click()
  const dialog = page.getByRole('dialog', { name: `Delete ${users.buyer.name}?` })
  await expect(dialog).toBeVisible()
  const confirm = dialog.getByRole('button', { name: 'Delete account' })
  await expect(confirm).toBeDisabled()

  await dialog.getByLabel(/reason/i).fill('Test account')
  await dialog.getByLabel(/your password/i).fill('AdminPass123')
  const request = page.waitForRequest((req) => req.method() === 'DELETE' && req.url().endsWith(`/api/admin/users/${users.buyer.id}`))
  await confirm.click()
  expect((await request).postDataJSON()).toEqual({ password: 'AdminPass123', reason: 'Test account', notify_user: false })

  await expect(dialog).toBeHidden()
  await expect(page.getByRole('status')).toContainText(`The account for ${users.buyer.name} was deleted.`)
  await expect(page.getByRole('button', { name: `Delete ${users.buyer.name}` })).toHaveCount(0)
})

test('admin accounts are protected and role filters match', async ({ page }) => {
  await openAdmin(page, '/admin/users')
  await expect(page.getByRole('button', { name: `Delete ${users.admin.name}` })).toHaveCount(0)
  await expect(page.getByRole('button', { name: `Suspend ${users.admin.name}` })).toHaveCount(0)
  await page.getByLabel('Filter users by role').selectOption('Owner')
  await expect(page.getByText(users.owner.name)).toBeVisible()
  await expect(page.getByText(users.buyer.name)).toHaveCount(0)
})

test('admin can review and verify broker credentials', async ({ page }) => {
  await openAdmin(page, '/admin/verifications', {
    [`PATCH admin/verifications/${verification.id}`]: { scenario: 'success', body: { data: { ...verification, status: 'verified', dhsud_checked_at: new Date().toISOString() } } },
  })
  const queue = new AdminVerificationsPage(page)
  await queue.searchInput.fill(users.broker.name)
  await queue.statusFilter.selectOption('Pending')
  await queue.reviewButton.click()
  await expect(page.getByRole('heading', { name: /verification details/i })).toBeVisible()
  const details = page.getByTestId('broker-credential-details')
  await expect(details).toContainText(verification.dhsud_registration_number)
  await expect(details).toContainText(verification.firm_name)
  await expect(details).toContainText('Butuan Realty Board')
  await page.getByRole('button', { name: /mark verified/i }).click()
  await expect(page.getByRole('status').filter({ hasText: /verification verified/i })).toBeVisible()
})

test('admin records the yearly DHSUD check for a verified broker', async ({ page }) => {
  const due = { ...verification, status: 'verified', dhsud_check_due: true }
  await openAdmin(page, '/admin/verifications', {
    'GET admin/verifications': { scenario: 'success', body: { data: [due] } },
    [`POST admin/verifications/${verification.id}/dhsud-check`]: { scenario: 'success', body: { data: { ...due, dhsud_check_due: false, dhsud_checked_at: new Date().toISOString() } } },
  })
  await expect(page.getByText(/due for the yearly DHSUD check/i)).toBeVisible()
  await new AdminVerificationsPage(page).reviewButton.click()
  await page.getByRole('button', { name: /not active/i }).click()
  await expect(page.getByText(/a note is required/i)).toBeVisible()
  await page.getByRole('button', { name: /DHSUD registration active/i }).click()
  await expect(page.getByText(/next check is due in a year/i)).toBeVisible()
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