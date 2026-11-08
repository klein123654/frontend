import { BasePage } from './base.page'
export class BuyerSavedPropertiesPage extends BasePage {
  get removeButtons() { return this.page.getByRole('button', { name: /remove/i }) }
  get listingLinks() { return this.page.getByRole('link', { name: /Riverside Commercial Space/i }) }
}
