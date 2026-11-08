import { BasePage } from './base.page'
export class ListingWorkspacePropertyFormPage extends BasePage {
  constructor(page: import('@playwright/test').Page, readonly basePath: '/owner' | '/developer' = '/owner') { super(page) }
  get title() { return this.page.getByLabel(/property title/i) }
  get type() { return this.page.getByLabel(/property type/i) }
  get listingType() { return this.page.getByLabel(/listing type/i) }
  get barangay() { return this.page.getByLabel(/barangay/i) }
  get location() { return this.page.getByLabel(/street \/ location/i) }
  get map() { return this.page.getByRole('application', { name: /choose the property location/i }) }
  get price() { return this.page.getByLabel(/price.*php|rent.*php/i) }
  get area() { return this.page.getByLabel(/property area/i) }
  get description() { return this.page.getByLabel(/description/i) }
  get imageInput() { return this.page.locator('#property-images') }
  get saveDraftButton() { return this.page.getByRole('button', { name: /save draft/i }) }
  get submitReviewButton() { return this.page.getByRole('button', { name: /submit for review/i }) }
}
