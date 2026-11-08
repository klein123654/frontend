import { BasePage } from './base.page'
export class RegisterPage extends BasePage {
  get name() { return this.page.locator('#register-name') }
  get email() { return this.page.locator('#register-email') }
  get phone() { return this.page.locator('#register-phone') }
  get password() { return this.page.locator('#register-password') }
  get confirmation() { return this.page.locator('#register-confirm') }
  get terms() { return this.page.getByRole('checkbox') }
  get submitButton() { return this.page.getByRole('button', { name: /create account|register/i }) }
  async chooseAccountType(name: string) { await this.page.getByRole('button', { name: new RegExp(name, 'i') }).click() }
}
