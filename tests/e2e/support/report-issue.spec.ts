import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { ReportIssuePage } from '../../pages/report-issue.page'

test('visitor can submit an issue report', async ({ page }) => {
  await installApiMocks(page)
  const report = new ReportIssuePage(page)
  await report.open('/report-issue')
  await report.titleInput.fill('Search field overlap')
  await report.descriptionInput.fill('The header overlaps the search field on a narrow viewport.')
  await report.submitButton.click()
  await expect(page.getByRole('status')).toContainText(/report has been submitted/i)
})

test('issue report validates required title, description, and optional email', async ({ page }) => {
  await installApiMocks(page)
  const report = new ReportIssuePage(page)
  await report.open('/report-issue')
  await report.submitButton.click()
  await expect(page.getByRole('status')).toContainText(/title and description are required/i)
  await report.titleInput.fill('A display issue')
  await report.descriptionInput.fill('The page is not rendering correctly.')
  await page.getByLabel('Email (optional)', { exact: true }).fill('invalid-email')
  await report.submitButton.click()
  await expect(page.getByRole('status')).toContainText(/valid email/i)
})

test('issue report displays server errors', async ({ page }) => {
  await installApiMocks(page, undefined, { 'POST reports': 'error' })
  const report = new ReportIssuePage(page)
  await report.open('/report-issue')
  await report.titleInput.fill('Search field overlap')
  await report.descriptionInput.fill('The header overlaps the search field.')
  await report.submitButton.click()
  await expect(page.getByRole('status')).toContainText(/temporarily unavailable/i)
})

test('issue report page has no axe violations', async ({ page }) => {
  await installApiMocks(page)
  await new ReportIssuePage(page).open('/report-issue')
  await expectNoAxeViolations(page)
})