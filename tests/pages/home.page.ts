import { BasePage } from './base.page'
export class HomePage extends BasePage {
  get searchInput() { return this.page.getByRole('searchbox').or(this.page.getByPlaceholder(/search/i).first()) }
  get searchButton() { return this.page.getByRole('button', { name: /search/i }).last() }
  async search(term: string) { await this.searchInput.fill(term); await this.searchButton.click() }
}
