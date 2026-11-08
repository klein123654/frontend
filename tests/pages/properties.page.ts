import { BasePage } from './base.page'
export class PropertiesPage extends BasePage {
  get searchInput() { return this.page.locator('#property-search') }
  get propertyType() { return this.page.locator('#property-type') }
  get listingType() { return this.page.locator('#listing-type') }
  get listingLinks() { return this.page.getByRole('link', { name: /Riverside Commercial Space/i }) }
  async search(term: string) { await this.searchInput.fill(term) }
  async openListing(title: string) { await this.page.getByRole('link', { name: new RegExp(title, 'i') }).click() }
}
