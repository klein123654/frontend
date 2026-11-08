import { BasePage } from './base.page'
export class AdminReportsPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search bug reports/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter report status/i }) }
  async openReport(id: number) { await this.page.getByRole('button', { name: `View report ${id}` }).click() }
}
