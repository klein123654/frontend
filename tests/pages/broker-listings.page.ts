import { BasePage } from './base.page'
export class BrokerListingsPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search listings/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /all statuses/i }) }
  get addButton() { return this.page.getByRole('link', { name: /add listing/i }) }
  async openCreate() { await this.page.goto('/broker/listings/create') }
}
