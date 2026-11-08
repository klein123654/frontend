import { BasePage } from './base.page'
export class ListingWorkspaceInquiriesPage extends BasePage {
  constructor(page: import('@playwright/test').Page, readonly basePath: '/owner' | '/developer' = '/owner') { super(page) }
  get searchInput() { return this.page.getByRole('textbox', { name: /search inquiries/i }) }
  get statusFilter() { return this.page.getByRole('combobox', { name: /filter inquiries by status/i }) }
  get replyInput() { return this.page.locator('#publisher-conversation-reply') }
  get conversationButtons() { return this.page.getByRole('button', { name: /view conversation/i }) }
}
