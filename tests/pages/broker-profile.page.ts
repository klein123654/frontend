import { BasePage } from './base.page'
export class BrokerProfilePage extends BasePage {
  get license() { return this.page.locator('#profile-license-number') }
  get prcValidUntil() { return this.page.locator('#profile-prc-valid-until') }
  get dhsudNumber() { return this.page.locator('#profile-dhsud-number') }
  get dhsudValidUntil() { return this.page.locator('#profile-dhsud-valid-until') }
  get firm() { return this.page.locator('#profile-firm-name') }
  get submitButton() { return this.page.getByRole('button', { name: /submit (renewal )?for review/i }) }

  async fillCredentials() {
    const nextYear = new Date(Date.now() + 300 * 86_400_000).toISOString().slice(0, 10)
    await this.license.fill('PRC-8765432')
    await this.prcValidUntil.fill(nextYear)
    await this.dhsudNumber.fill('DHSUD-CRG-0101')
    await this.dhsudValidUntil.fill(nextYear)
    await this.firm.fill('Northstar Realty')
  }
}
