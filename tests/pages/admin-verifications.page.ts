import { BasePage } from './base.page'
export class AdminVerificationsPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search verification requests/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter verifications/i }) }
  get reviewButton() { return this.page.getByRole('button', { name: /review verification/i }) }
}
