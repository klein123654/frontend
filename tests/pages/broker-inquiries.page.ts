import { BasePage } from './base.page'
export class BrokerInquiriesPage extends BasePage {
  get searchInput() { return this.page.getByPlaceholder(/search inquiries/i) }
  get viewButtons() { return this.page.getByRole('button', { name: /view/i }) }
  get conversationButton() { return this.page.getByRole('button', { name: /view conversation/i }) }
}
