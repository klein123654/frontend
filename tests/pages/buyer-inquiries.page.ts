import { BasePage } from './base.page'
export class BuyerInquiriesPage extends BasePage {
  get conversationButtons() { return this.page.getByRole('button', { name: /view conversation/i }) }
  get replyInput() { return this.page.getByLabel(/reply/i) }
}
