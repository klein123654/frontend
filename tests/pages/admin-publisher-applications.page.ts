import { BasePage } from './base.page'
export class AdminPublisherApplicationsPage extends BasePage {
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter publisher applications/i }) }
  get reviewButton() { return this.page.getByRole('button', { name: /^review$/i }) }
}
