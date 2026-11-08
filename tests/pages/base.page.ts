import { type Locator, type Page } from '@playwright/test'
import { waitForRouteReady } from '../helpers/route-smoke'

export class BasePage {
  constructor(readonly page: Page) {}
  get heading(): Locator { return this.page.getByRole('heading', { level: 1 }) }
  get status(): Locator { return this.page.getByRole('status') }
  get alert(): Locator { return this.page.getByRole('alert') }
  async open(path: string) { await this.page.goto(path); await waitForRouteReady(this.page) }
}
