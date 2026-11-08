import { BasePage } from './base.page'
export class BrokerProfilePage extends BasePage {
  get license() { return this.page.getByLabel(/prc license number/i) }
  get agency() { return this.page.getByLabel(/agency \/ brokerage/i) }
  get submitButton() { return this.page.getByRole('button', { name: /submit for review/i }) }
}
