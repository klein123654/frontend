import { BasePage } from './base.page'
export class ListingWorkspaceDashboardPage extends BasePage {
  constructor(page: import('@playwright/test').Page, readonly basePath: '/owner' | '/developer' = '/owner') { super(page) }
  get addPropertyButton() { return this.page.getByRole('button', { name: /add property/i }) }
  async openListings() { await this.page.goto(`${this.basePath}/properties`) }
  async openInquiries() { await this.page.goto(`${this.basePath}/inquiries`) }
}
