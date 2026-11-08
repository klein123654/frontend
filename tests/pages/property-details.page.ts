import { BasePage } from './base.page'
export class PropertyDetailsPage extends BasePage {
  get saveButton() { return this.page.getByRole('button', { name: /save property/i }) }
  get inquiryMessage() { return this.page.locator('#inquiry-message') }
  get sendInquiryButton() { return this.page.getByRole('button', { name: /send inquiry/i }) }
  async inquire(message: string) { await this.inquiryMessage.fill(message); await this.sendInquiryButton.click() }
}
