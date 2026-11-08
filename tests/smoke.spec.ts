import { expect, test } from '@playwright/test'
import { installApiMocks } from './helpers/api-mocks'
import { signInAs } from './helpers/auth'
import { waitForRouteReady } from './helpers/route-smoke'
import { AdminDashboardPage } from './pages/admin-dashboard.page'
import { BrokerListingsPage } from './pages/broker-listings.page'
import { ListingWorkspacePropertyFormPage } from './pages/listing-workspace-property-form.page'

test.describe('authenticated workspace smoke test', () => {
  test('opens the critical admin, broker, and owner pages in order', async ({ browser }) => {
    const adminContext = await browser.newContext()
    const adminPage = await adminContext.newPage()
    await installApiMocks(adminPage, 'admin')
    await signInAs(adminPage, 'admin')
    await expect(new AdminDashboardPage(adminPage).heading).toHaveText('Dashboard Overview')
    await adminPage.goto('/admin/properties')
    await waitForRouteReady(adminPage, 'Property Approvals')
    await expect(adminPage.getByRole('heading', { name: 'Property Approvals' })).toBeVisible()
    await adminContext.close()

    const brokerContext = await browser.newContext()
    const brokerPage = await brokerContext.newPage()
    await installApiMocks(brokerPage, 'broker')
    await signInAs(brokerPage, 'broker')
    await brokerPage.goto('/broker/listings')
    await waitForRouteReady(brokerPage, 'My Listings')
    await expect(new BrokerListingsPage(brokerPage).heading).toHaveText('My Listings')
    await brokerPage.goto('/broker/listings/create')
    await waitForRouteReady(brokerPage, 'Add New Listing')
    await expect(brokerPage.locator('#broker-title')).toBeVisible()
    await brokerContext.close()

    const ownerContext = await browser.newContext()
    const ownerPage = await ownerContext.newPage()
    await installApiMocks(ownerPage, 'owner')
    await signInAs(ownerPage, 'owner')
    await ownerPage.goto('/owner/properties/create')
    await waitForRouteReady(ownerPage, 'Add New Property')
    await expect(new ListingWorkspacePropertyFormPage(ownerPage).title).toBeVisible()
    await ownerContext.close()
  })
})