import { BasePage } from './base.page'
export class ForgotPasswordPage extends BasePage {
  get email() { return this.page.locator('#recovery-email') }
  get submitButton() { return this.page.getByRole('button', { name: /send reset|reset link|continue/i }) }
}
