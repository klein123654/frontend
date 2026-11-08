import { BasePage } from './base.page'
export class AdminDashboardPage extends BasePage {
  get navigation() { return this.page.getByRole('navigation', { name: /admin/i }) }
}
