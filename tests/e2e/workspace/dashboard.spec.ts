import { expect, test, type Page } from '@playwright/test'
import { defaultApiResponse, type ApiOverrides } from '../../fixtures/api-fixtures'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import type { AppRole } from '../../fixtures/test-data'

async function openDashboard(page: Page, role: AppRole, overrides: ApiOverrides = {}) {
  await page.addInitScript(() => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('butuanspaces_dashboard_section:')) localStorage.removeItem(key)
    }
  })
  await installApiMocks(page, role, overrides)
  await seedAuthenticatedRole(page, role)
  await page.goto(`/${role}/dashboard`)
  await waitForRouteReady(page)
}

const brokerDashboard = defaultApiResponse('my/dashboard', 'GET', 'broker') as { data: Record<string, unknown> & { credentials: Record<string, unknown> } }

test.describe('owner dashboard', () => {
  test('cards switch the chart and insight panel', async ({ page }) => {
    await openDashboard(page, 'owner')
    const panel = page.getByRole('tabpanel')

    await expect(page.getByRole('tab', { name: /Inquiries 4/ })).toHaveAttribute('aria-selected', 'true')
    await expect(panel.getByRole('heading', { name: 'Inquiries per week' })).toBeVisible()
    await expect(panel.getByText('AI insight')).toBeVisible()
    await expect(panel.getByText('Inquiries rose this week.')).toBeVisible()

    await page.getByRole('tab', { name: /Page views/ }).click()
    await expect(page.getByRole('tab', { name: /Page views/ })).toHaveAttribute('aria-selected', 'true')
    await expect(panel.getByRole('heading', { name: 'Page views per day' })).toBeVisible()

    await page.getByRole('tab', { name: /Live listings/ }).click()
    await expect(panel.getByText('Review status', { exact: true })).toBeVisible()
  })

  test('to-dos link to the right pages and sections start collapsed', async ({ page }) => {
    await openDashboard(page, 'owner')
    const todos = page.getByRole('region', { name: 'Needs your attention' })
    await expect(todos.getByRole('link', { name: /1 inquiry waiting for a reply/ })).toHaveAttribute('href', '/owner/inquiries')
    await expect(todos.getByRole('link', { name: /1 draft not submitted yet/ })).toHaveAttribute('href', '/owner/properties')

    for (const name of ['Your listings', 'Recent inquiries', 'Market insights']) {
      await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveAttribute('aria-expanded', 'false')
    }
    await page.getByRole('button', { name: /Recent inquiries/ }).click()
    await expect(page.getByRole('button', { name: /Recent inquiries/ })).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('link', { name: 'All inquiries →' })).toBeVisible()
  })

  test('labels a non-AI card summary as a summary', async ({ page }) => {
    await openDashboard(page, 'owner', {
      'POST my/dashboard/insight': { scenario: 'success', body: { data: { bullets: ['4 inquiries in the last 30 days.'], ai_written: false } } },
    })
    const panel = page.getByRole('tabpanel')
    await expect(panel.getByText('4 inquiries in the last 30 days.')).toBeVisible()
    await expect(panel.getByText('Summary', { exact: true })).toBeVisible()
    await expect(panel.getByText('AI insight')).toHaveCount(0)
  })

  test('has no axe violations with every section open', async ({ page }) => {
    await openDashboard(page, 'owner')
    for (const name of ['Your listings', 'Recent inquiries', 'Market insights']) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
    }
    await expect(page.getByText('Your price vs the market')).toBeVisible()
    await expectNoAxeViolations(page)
  })
})

test.describe('broker credentials line', () => {
  test('is a single line without countdowns while credentials are current', async ({ page }) => {
    await openDashboard(page, 'broker')
    const line = page.getByTestId('credential-line')
    await expect(line).toContainText('✓ Verified broker')
    await expect(line).toContainText('PRC-0012345')
    await expect(line).not.toContainText('days left')
  })

  test('shows countdowns and a to-do when a credential is near expiry', async ({ page }) => {
    await openDashboard(page, 'broker', {
      'GET my/dashboard': { scenario: 'success', body: { data: { ...brokerDashboard.data, credentials: { ...brokerDashboard.data.credentials, credential_status: 'expiring', dhsud_days_left: 21 } } } },
    })
    const line = page.getByTestId('credential-line')
    await expect(line).toContainText('Renewal needed')
    await expect(line).toContainText('21 days left')
    await expect(page.getByRole('region', { name: 'Needs your attention' }).getByRole('link', { name: /expires in 21 days/ })).toHaveAttribute('href', '/broker/profile')
  })
})

test.describe('admin dashboard', () => {
  test('lists review to-dos and shows the queue card', async ({ page }) => {
    await openDashboard(page, 'admin')
    const todos = page.getByRole('region', { name: 'Waiting for you' })
    await expect(todos.getByRole('link', { name: /1 listing to review/ })).toHaveAttribute('href', '/admin/properties')
    await expect(todos.getByRole('link', { name: /1 broker verification waiting/ })).toHaveAttribute('href', '/admin/verifications')

    await page.getByRole('tab', { name: /Waiting for review/ }).click()
    await expect(page.getByRole('tabpanel').getByRole('heading', { name: 'Review queue' })).toBeVisible()
    await expect(page.getByRole('tabpanel').getByRole('listitem').first()).toBeVisible()
  })

  test('has no axe violations with every section open', async ({ page }) => {
    await openDashboard(page, 'admin')
    for (const name of ['Listings & users', 'Review queue', 'Market insights']) {
      await page.getByRole('button', { name: new RegExp(name) }).click()
    }
    await expectNoAxeViolations(page)
  })
})
