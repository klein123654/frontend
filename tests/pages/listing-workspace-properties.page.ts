import { BasePage } from './base.page'
export class ListingWorkspacePropertiesPage extends BasePage {
  constructor(page: import('@playwright/test').Page, readonly basePath: '/owner' | '/developer' = '/owner') { super(page) }
  get searchInput() { return this.page.getByRole('textbox', { name: /search properties/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter by status/i }) }
  get resetButton() { return this.page.getByRole('button', { name: /reset/i }) }
  async openCreate() { await this.page.goto(`${this.basePath}/properties/create`) }
  async openEdit(id: number) { await this.page.goto(`${this.basePath}/properties/${id}/edit`) }
  async openDetails(id: number) { await this.page.goto(`${this.basePath}/properties/${id}`) }
}
