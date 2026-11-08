import { BasePage } from './base.page'
export class ReportIssuePage extends BasePage {
  get titleInput() { return this.page.getByLabel(/issue title/i) }
  get descriptionInput() { return this.page.getByLabel(/what happened/i) }
  get submitButton() { return this.page.getByRole('button', { name: /submit report/i }) }
  async submit(title: string, description: string) { await this.titleInput.fill(title); await this.descriptionInput.fill(description); await this.submitButton.click() }
}
