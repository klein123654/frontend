import { BasePage } from './base.page'
export class ListingWorkspacePropertyDetailsPage extends BasePage {
  constructor(page: import('@playwright/test').Page, readonly basePath: '/owner' | '/developer' = '/owner') { super(page) }
  get editButton() { return this.page.getByRole('link', { name: /edit property/i }) }
  get backLink() { return this.page.getByRole('link', { name: /back to my properties/i }) }
}
