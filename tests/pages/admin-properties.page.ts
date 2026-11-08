import { BasePage } from './base.page'
export class AdminPropertiesPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search property approvals/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter property status/i }) }
  async review(title: string) { await this.page.getByRole('button', { name: `Review ${title}` }).click() }
}
