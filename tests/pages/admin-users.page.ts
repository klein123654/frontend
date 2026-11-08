import { BasePage } from './base.page'
export class AdminUsersPage extends BasePage {
  get searchInput() { return this.page.getByRole('textbox', { name: /search users/i }) }
  get roleFilter() { return this.page.getByRole('combobox', { name: /filter users by role/i }) }
  async accountAction(action: 'Suspend' | 'Activate', name: string) { await this.page.getByRole('button', { name: `${action} ${name}` }).click() }
}
