import { BasePage } from './base.page'
export class BrokerDashboardPage extends BasePage {
  get verificationLink() { return this.page.getByRole('link', { name: /manage verification/i }) }
}
