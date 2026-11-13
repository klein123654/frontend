import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { users } from '../../fixtures/test-data'

test.describe('account settings', () => {
  test('visitors are sent to sign in', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)account$/)
  })

  test('buyer can update details and change password', async ({ page }) => {
    await installApiMocks(page, 'buyer', {
      'PATCH user': { scenario: 'success', body: { user: { ...users.buyer, name: 'Dana Updated', email_verified: true } } },
      'PUT user/password': { scenario: 'success', body: { message: 'Password updated. Other devices have been signed out.' } },
    })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/account')
    await waitForRouteReady(page, 'Account settings')

    await expect(page.getByLabel('Full name')).toHaveValue(users.buyer.name)
    await page.getByLabel('Full name').fill('Dana Updated')
    await page.getByRole('button', { name: 'Save details' }).click()
    await expect(page.getByText('Your details have been saved.')).toBeVisible()

    await page.locator('#new-password').fill('NewPassword123!')
    await page.locator('#confirm-password').fill('Different123!')
    await expect(page.getByText("The passwords don't match.")).toBeVisible()
    await expect(page.getByRole('button', { name: 'Change password' })).toBeDisabled()

    await page.locator('#current-password').fill('old-password')
    await page.locator('#confirm-password').fill('NewPassword123!')
    await page.getByRole('button', { name: 'Change password' }).click()
    await expect(page.getByText('Password updated. Other devices have been signed out.')).toBeVisible()
  })

  test('email change explains the confirmation link and shows the result', async ({ page }) => {
    await installApiMocks(page, 'buyer', {
      'POST user/email': { scenario: 'success', body: { message: 'We sent a confirmation link to new@example.test. Your email changes once you open it.' } },
    })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/account')
    await waitForRouteReady(page, 'Account settings')

    await page.getByLabel('New email address').fill('new@example.test')
    await page.locator('#email-password').fill('secret-password')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(page.getByText(/We sent a confirmation link to new@example.test/)).toBeVisible()

    await page.goto('/account?email=taken')
    await expect(page.getByText(/already used by another account/)).toBeVisible()
    await expect(page).toHaveURL(/\/account$/)
  })

  test('delete account needs password and typed confirmation', async ({ page }) => {
    await installApiMocks(page, 'buyer', { 'DELETE user': { scenario: 'success', body: { message: 'Your account has been deleted.' } } })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/account')
    await waitForRouteReady(page, 'Account settings')

    const deleteButton = page.getByRole('button', { name: 'Delete my account' })
    await expect(deleteButton).toBeDisabled()
    await page.locator('#delete-password').fill('secret-password')
    await page.getByLabel(/Type DELETE to confirm/).fill('delete')
    await deleteButton.click()

    await expect(page).toHaveURL(/\/$/)
    await expect(page.getByText('Your account has been deleted.')).toBeVisible()
  })

  test('admins see settings inside their sidebar without a delete option', async ({ page }) => {
    await installApiMocks(page, 'admin')
    await seedAuthenticatedRole(page, 'admin')
    await page.goto('/account')
    await waitForRouteReady(page, 'Account settings')

    await expect(page.getByRole('link', { name: 'Manage Users' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Delete account' })).toHaveCount(0)
  })

  test('unconfirmed email shows a reminder that can resend the link', async ({ page }) => {
    await installApiMocks(page, 'buyer', {
      'GET user': { scenario: 'success', body: { user: { ...users.buyer, email_verified: false } } },
      'POST email/verification-notification': { scenario: 'success', body: { message: 'We sent a new confirmation link to buyer@example.test.' } },
    })
    await seedAuthenticatedRole(page, 'buyer')
    await page.goto('/properties')
    await waitForRouteReady(page)

    const reminder = page.getByRole('region', { name: 'Email confirmation' })
    await expect(reminder).toContainText('Please confirm your email address')
    await reminder.getByRole('button', { name: 'Resend link' }).click()
    await expect(reminder).toContainText('We sent a new confirmation link')
  })

  test('account page has no axe violations', async ({ page }) => {
    await installApiMocks(page, 'owner')
    await seedAuthenticatedRole(page, 'owner')
    await page.goto('/account')
    await waitForRouteReady(page, 'Account settings')
    await expectNoAxeViolations(page)
  })
})
