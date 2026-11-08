import { BasePage } from './base.page'
export class PublisherApplicationPage extends BasePage {
  get submitButton() { return this.page.getByRole('button', { name: /submit|request/i }) }
  get status() { return this.page.getByRole('status') }
}
