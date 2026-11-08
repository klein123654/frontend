import { expect, test } from '@playwright/test'
import { installApiMocks } from '../../helpers/api-mocks'
import { signInAs, seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { listing, users, type AppRole } from '../../fixtures/test-data'
import { ForgotPasswordPage } from '../../pages/forgot-password.page'
import { LoginPage } from '../../pages/login.page'
import { RegisterPage } from '../../pages/register.page'
import { ResetPasswordPage } from '../../pages/reset-password.page'

test.describe('authentication', () => {
  // See TESTING.md, App bugs found by tests: login inline validation announcement.
  test.fixme('login rejects missing credentials', async ({ page }) => {
    await installApiMocks(page)
    const login = new LoginPage(page)
    await login.open('/login')
    await login.submitButton.click()
    await expect(login.page.getByRole('alert')).toBeVisible()
  })

  test('login reports API authentication errors', async ({ page }) => {
    await installApiMocks(page, 'buyer', { 'POST login': { scenario: 'error', status: 401, body: { message: 'Invalid email or password.', type: 'authentication_error' } } })
    const login = new LoginPage(page)
    await login.open('/login')
    await login.submit('buyer@example.test', 'wrong-password')
    await expect(login.page.getByRole('alert')).toContainText(/sign in again|invalid/i)
  })

  for (const role of ['buyer', 'owner', 'developer', 'broker', 'admin'] as AppRole[]) {
    test(`login redirects ${role} to the correct workspace`, async ({ page }) => {
      await installApiMocks(page, role)
      await signInAs(page, role)
    })
  }

  test('protected pages redirect guests to login with a return path', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/owner/properties')
    await expect(page).toHaveURL(/\/login\?redirect=\/owner\/properties$/)
  })

  test('suspended accounts are signed out and redirected', async ({ page }) => {
    const suspended = { ...users.owner, account_status: 'suspended' }
    await installApiMocks(page, 'owner', { 'GET user': { scenario: 'success', body: { user: suspended } } })
    await seedAuthenticatedRole(page, 'owner', 'suspended')
    await page.goto('/owner/dashboard')
    await expect(page).toHaveURL(/\/login\?suspended=1/)
  })

  test('users cannot open another role workspace', async ({ page }) => {
    await installApiMocks(page, 'admin')
    await seedAuthenticatedRole(page, 'admin')
    await page.goto('/owner/dashboard')
    await expect(page).toHaveURL(/\/admin\/dashboard$/)
  })

  test('login page has no axe violations', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/login')
    await expectNoAxeViolations(page)
  })
})

test.describe('registration', () => {
  test('registration reports required fields and account terms', async ({ page }) => {
    await installApiMocks(page)
    const register = new RegisterPage(page)
    await register.open('/register')
    await register.submitButton.click()
    await expect(page.getByText('Please enter your full name.')).toBeVisible()
    await expect(page.getByText('Please enter a valid email address.')).toBeVisible()
    await expect(page.getByText('Enter a valid Philippine mobile number.')).toBeVisible()
    await expect(page.getByText('Password must contain at least 8 characters.')).toBeVisible()
    await expect(page.getByText('Please accept the account terms.')).toBeVisible()
  })

  test('registration validates password composition and confirmation', async ({ page }) => {
    await installApiMocks(page)
    const register = new RegisterPage(page)
    await register.open('/register')
    await register.name.fill('Dana Buyer')
    await register.email.fill('buyer@example.test')
    await register.phone.fill('09171234567')
    await register.password.fill('12345678')
    await register.confirmation.fill('87654321')
    await register.submitButton.click()
    await expect(page.getByText('Password must include a letter.')).toBeVisible()
    await expect(page.getByText('Passwords do not match.')).toBeVisible()

    await register.password.fill('passwordonly')
    await register.confirmation.fill('passwordonly')
    await register.submitButton.click()
    await expect(page.getByText('Password must include a number.')).toBeVisible()
  })

  test('registration succeeds with valid details and accepted terms', async ({ page }) => {
    await installApiMocks(page, 'buyer')
    const register = new RegisterPage(page)
    await register.open('/register')
    await register.name.fill('Dana Buyer')
    await register.email.fill(`buyer-${Date.now()}@example.test`)
    await register.phone.fill('09171234567')
    await register.password.fill('Password123')
    await register.confirmation.fill('Password123')
    await register.terms.check()
    await register.submitButton.click()
    await expect(page.getByRole('status')).toContainText(/account created/i)
  })

  test('registration page has no axe violations', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/register')
    await waitForRouteReady(page, 'Create your account')
    await expectNoAxeViolations(page)
  })
})

test.describe('password recovery', () => {
  test('forgot password validates email and confirms a reset request', async ({ page }) => {
    await installApiMocks(page)
    const forgot = new ForgotPasswordPage(page)
    await forgot.open('/forgot-password')
    await forgot.email.fill('not-an-email')
    await forgot.submitButton.click()
    await expect(page.getByRole('alert')).toContainText(/valid email/i)
    await forgot.email.fill('buyer@example.test')
    await forgot.submitButton.click()
    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible()
  })

  test('forgot password reports API errors', async ({ page }) => {
    await installApiMocks(page, undefined, { 'POST forgot-password': 'error' })
    const forgot = new ForgotPasswordPage(page)
    await forgot.open('/forgot-password')
    await forgot.email.fill('buyer@example.test')
    await forgot.submitButton.click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('reset password rejects incomplete links and mismatched confirmation', async ({ page }) => {
    await installApiMocks(page)
    const reset = new ResetPasswordPage(page)
    await reset.open('/reset-password')
    await reset.password.fill('Password123')
    await reset.confirmation.fill('Password456')
    await reset.submitButton.click()
    await expect(page.getByRole('alert')).toContainText(/incomplete/i)
  })

  test('reset password saves a new password', async ({ page }) => {
    await installApiMocks(page, undefined, { 'POST reset-password': { scenario: 'success', body: { message: 'Password reset successfully.' } } })
    const reset = new ResetPasswordPage(page)
    await reset.open('/reset-password?token=reset-token&email=buyer%40example.test')
    await reset.password.fill('Password123')
    await reset.confirmation.fill('Password123')
    await reset.submitButton.click()
    await expect(page).toHaveURL(/\/login\?reset=success/)
  })

  test('reset password reports confirmation validation', async ({ page }) => {
    await installApiMocks(page, undefined, {
      'POST reset-password': { scenario: 'validation', body: { message: 'The given data was invalid.', type: 'validation_error', errors: { password: ['The password field confirmation does not match.'] } }, delayMs: 500 },
    })
    const reset = new ResetPasswordPage(page)
    await reset.open('/reset-password?token=reset-token&email=buyer%40example.test')
    await reset.password.fill('Password123')
    await reset.confirmation.fill('Different123')
    await reset.submitButton.click()
    await expect(page.getByRole('alert')).toContainText(/confirmation does not match/i)
  })

  test('password recovery page has no axe violations', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/forgot-password')
    await waitForRouteReady(page, "Let's get you back on track")
    await expectNoAxeViolations(page)
  })

  test('reset password page has no axe violations', async ({ page }) => {
    await installApiMocks(page)
    await page.goto('/reset-password?token=reset-token&email=buyer%40example.test')
    await waitForRouteReady(page, 'Set a new password')
    await expectNoAxeViolations(page)
  })
})
