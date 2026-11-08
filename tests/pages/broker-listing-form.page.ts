import { BasePage } from './base.page'
export class BrokerListingFormPage extends BasePage {
  get title() { return this.page.getByLabel(/listing title|property title/i) }
  get saveDraftButton() { return this.page.getByRole('button', { name: /save draft/i }) }
  get submitReviewButton() { return this.page.getByRole('button', { name: /submit for review/i }) }
}
