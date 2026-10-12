import { test, expect, type Page } from '@playwright/test'

async function createBrokerListing(page: Page, title: string, submit: boolean) {
  await page.goto('/broker/listings/create')
  await page.locator('#broker-title').fill(title)
  if (submit) {
    await page.locator('#broker-location').fill('Butuan City')
    await page.locator('#broker-barangay').fill('Ampayon')
    await page.locator('#broker-price').fill('32000')
    await page.locator('#broker-area').fill('150')
    await page.locator('#broker-description').fill('Automated admin review workflow test.')
  }
  await page.getByRole('button', { name: submit ? 'Submit for Review' : 'Save Draft' }).click()
  await expect(page).toHaveURL(/\/broker\/listings\/\d+$/)
}

async function seed<T>(page: Page, key: string, record: T) {
  await page.addInitScript(({ storageKey, value }) => {
    if (!localStorage.getItem(storageKey)) localStorage.setItem(storageKey, JSON.stringify([value]))
  }, { storageKey: key, value: record })
}

test.describe('Admin Workspace workflows', () => {
  test('reviews a Pending Broker listing and preserves the demo decision', async ({ page }) => {
    const title = 'Automated Admin Pending Listing'
    await createBrokerListing(page, title, true)
    await page.goto('/admin/properties')
    await expect(page.getByText(title, { exact: true })).toBeVisible()
    await page.getByRole('button', { name: `Review ${title}` }).click()
    await expect(page.getByRole('button', { name: 'Approve Listing' })).toBeVisible()
    await page.getByRole('button', { name: 'Approve Listing' }).click()
    await expect(page.getByRole('status')).toContainText('Demo decision saved: Approved.')
    await expect(page.getByRole('row').filter({ hasText: title }).getByText('Approved')).toBeVisible()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: title }).getByText('Approved')).toBeVisible()
  })

  test('requires a reason before rejecting a Pending listing', async ({ page }) => {
    const title = 'Automated Admin Rejection Listing'
    await createBrokerListing(page, title, true)
    await page.goto('/admin/properties')
    await page.getByRole('button', { name: `Review ${title}` }).click()
    await page.getByRole('button', { name: 'Reject Listing' }).click()
    await expect(page.getByRole('status')).toContainText('A rejection reason is required.')
    await page.locator('#admin-review-note').fill('Missing required supporting documents.')
    await page.getByRole('button', { name: 'Reject Listing' }).click()
    await expect(page.getByRole('row').filter({ hasText: title }).getByText('Rejected')).toBeVisible()
  })

  test('does not approve a Draft listing', async ({ page }) => {
    const title = 'Automated Admin Draft Listing'
    await createBrokerListing(page, title, false)
    await page.goto('/admin/properties')
    await page.getByRole('button', { name: `Review ${title}` }).click()
    await expect(page.getByRole('button', { name: 'Approve Listing' })).toHaveCount(0)
    await expect(page.getByText('This listing is not awaiting review.')).toBeVisible()
  })

  test('handles seeded demo broker verification requests', async ({ page }) => {
    await seed(page, 'butuanspaces-admin-verifications-v1', {
      id: 1001, name: 'Playwright Broker Applicant', email: 'broker@example.test',
      affiliation: 'Test Brokerage', submittedAt: '2026-10-11', status: 'Pending', note: ''
    })
    await page.goto('/admin/verifications')
    await expect(page.getByText('Playwright Broker Applicant')).toBeVisible()
    await page.getByRole('button', { name: 'Review verification 1001' }).click()
    await page.getByRole('button', { name: 'Mark Verified (Demo)' }).click()
    await expect(page.getByRole('status')).toContainText('Demo decision saved: Verified.')
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: 'Playwright Broker Applicant' }).getByText('Verified')).toBeVisible()
  })

  test('manages status of a seeded demo user', async ({ page }) => {
    await seed(page, 'butuanspaces-admin-users-v1', {
      id: 2001, name: 'Playwright Example User', email: 'user@example.test',
      role: 'Client', status: 'Active', joinedAt: '2026-10-11'
    })
    await page.goto('/admin/users')
    await page.getByRole('button', { name: 'Suspend Playwright Example User' }).click()
    await expect(page.getByRole('row').filter({ hasText: 'Playwright Example User' }).getByText('Suspended')).toBeVisible()
    await page.reload()
    await page.getByRole('button', { name: 'Activate Playwright Example User' }).click()
    await expect(page.getByRole('row').filter({ hasText: 'Playwright Example User' }).getByText('Active')).toBeVisible()
  })

  test('processes a seeded administrative inquiry', async ({ page }) => {
    await seed(page, 'butuanspaces-admin-inquiries-v1', {
      id: 3001, name: 'Playwright Sender', email: 'sender@example.test',
      subject: 'Demo Administrative Question', message: 'This is a test inquiry.',
      createdAt: '2026-10-11', status: 'New'
    })
    await page.goto('/admin/inquiries')
    await page.getByRole('button', { name: 'View inquiry 3001' }).click()
    await expect(page.getByText('This is a test inquiry.')).toBeVisible()
    await page.locator('#admin-inquiry-status').selectOption('Resolved')
    await expect(page.getByRole('status')).toContainText('Inquiry status saved')
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: 'Demo Administrative Question' }).getByText('Resolved')).toBeVisible()
  })

  test('submits a public demo bug report and resolves it in Admin', async ({ page }) => {
    await page.goto('/report-issue')
    await page.locator('#issue-title').fill('Playwright Mobile Menu Issue')
    await page.locator('#issue-description').fill('Navigation does not expand on narrow screens.')
    await page.getByRole('button', { name: 'Submit Demo Report' }).click()
    await expect(page.getByRole('status')).toContainText('Demo issue saved')
    await page.goto('/admin/reports')
    await expect(page.getByText('Playwright Mobile Menu Issue', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'View report 1' }).click()
    await page.locator('#admin-report-status').selectOption('Resolved')
    await expect(page.getByRole('status')).toContainText('Report status saved')
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: 'Playwright Mobile Menu Issue' }).getByText('Resolved')).toBeVisible()
  })

  test('validates missing issue title and description', async ({ page }) => {
    await page.goto('/report-issue')
    await page.getByRole('button', { name: 'Submit Demo Report' }).click()
    await expect(page.getByRole('status')).toContainText('Issue title and description are required.')
    await page.goto('/admin/reports')
    await expect(page.getByText('No bug reports yet.')).toBeVisible()
  })
})
