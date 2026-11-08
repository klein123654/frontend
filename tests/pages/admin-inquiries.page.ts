import { BasePage } from './base.page'
export class AdminInquiriesPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search admin inquiries/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter inquiry status/i }) }
  async openInquiry(id: number) { await this.page.getByRole('button', { name: `View inquiry ${id}` }).click() }
}
