import { BasePage } from './base.page'
export class LoginPage extends BasePage {
  get email() { return this.page.locator('#login-email') }
  get password() { return this.page.locator('#login-password') }
  get submitButton() { return this.page.getByRole('button', { name: /sign in/i }) }
  async submit(email: string, password: string) { await this.email.fill(email); await this.password.fill(password); await this.submitButton.click() }
}
