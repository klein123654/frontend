import { BasePage } from './base.page'
export class BrokerListingDetailsPage extends BasePage {
  get editButton() { return this.page.getByRole('link', { name: /edit draft/i }) }
  get backLink() { return this.page.getByRole('link', { name: /back to my listings/i }) }
}
