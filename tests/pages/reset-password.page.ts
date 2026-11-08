import { BasePage } from './base.page'
export class ResetPasswordPage extends BasePage {
  get password() { return this.page.locator('#new-password') }
  get confirmation() { return this.page.locator('#confirm-password') }
  get submitButton() { return this.page.getByRole('button', { name: /reset password/i }) }
}
