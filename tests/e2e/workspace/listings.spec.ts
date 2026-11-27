import { expect, test } from '@playwright/test'
import type { ApiOverrides } from '../../fixtures/api-fixtures'
import { installApiMocks } from '../../helpers/api-mocks'
import { seedAuthenticatedRole } from '../../helpers/auth'
import { expectNoAxeViolations } from '../../helpers/accessibility'
import { waitForRouteReady } from '../../helpers/route-smoke'
import { draftListing, listing, users, type AppRole } from '../../fixtures/test-data'
import { ListingWorkspaceDashboardPage } from '../../pages/listing-workspace-dashboard.page'
import { ListingWorkspacePropertiesPage } from '../../pages/listing-workspace-properties.page'
import { ListingWorkspacePropertyFormPage } from '../../pages/listing-workspace-property-form.page'
import { ListingWorkspacePropertyDetailsPage } from '../../pages/listing-workspace-property-details.page'
import { ListingWorkspaceInquiriesPage } from '../../pages/listing-workspace-inquiries.page'

const workspaces: { role: 'owner'; basePath: '/owner' }[] = [
  { role: 'owner', basePath: '/owner' },
]

async function openWorkspace(page: import('@playwright/test').Page, role: AppRole, path: string, overrides: ApiOverrides = {}) {
  await installApiMocks(page, role, overrides)
  await seedAuthenticatedRole(page, role)
  await page.goto(path)
  await waitForRouteReady(page)
}

async function fillPropertyForm(page: import('@playwright/test').Page, title: string) {
  await page.locator('#property-title').fill(title)
  await page.locator('#property-type').click()
  await page.getByRole('option', { name: 'Office Spaces' }).click()
  await page.locator('#listing-type').click()
  await page.getByRole('option', { name: 'For Rent' }).click()
  await page.locator('#property-barangay').fill('Baan KM 3')
  await page.locator('#property-location').fill('12 Riverside Road')
  await page.locator('#property-price').fill('50000')
  await page.locator('#property-area').fill('150')
  await page.locator('#property-description').fill('A bright commercial space close to the city center.')
}

for (const { role, basePath } of workspaces) {
  test.describe(`${role} listing workspace`, () => {
    test(`${role} can open the dashboard and navigate to listings`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/dashboard`)
      const dashboard = new ListingWorkspaceDashboardPage(page, basePath)
      await expect(dashboard.heading).toHaveText('Dashboard Overview')
      await dashboard.openListings()
      await expect(new ListingWorkspacePropertiesPage(page, basePath).heading).toHaveText('My Properties')
    })

    test(`${role} can search and filter listings`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties`)
      const properties = new ListingWorkspacePropertiesPage(page, basePath)
      await properties.searchInput.fill('Draft Riverside')
      await expect(page.getByText(draftListing.title)).toBeVisible()
      await properties.statusFilter.selectOption({ label: 'Draft' }).catch(async () => {
        await properties.statusFilter.click()
        await page.getByRole('option', { name: 'Draft' }).click()
      })
      await expect(page.getByText(draftListing.title)).toBeVisible()
    })

    test(`${role} can save a property draft`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties/create`)
      const form = new ListingWorkspacePropertyFormPage(page, basePath)
      await fillPropertyForm(page, `Draft ${role} unit`)
      await form.saveDraftButton.click()
      const dialog = page.getByRole('dialog', { name: 'Draft saved' })
      await expect(dialog).toContainText(`Draft ${role} unit`)
      await expect(dialog.getByRole('link', { name: 'View my properties' })).toHaveAttribute('href', `${basePath}/properties`)

      // OK clears the form for the next listing.
      await dialog.getByRole('button', { name: 'OK, add another property' }).click()
      await expect(dialog).toBeHidden()
      await expect(page.locator('#property-title')).toHaveValue('')
      await expect(page.locator('#property-barangay')).toHaveValue('')
    })

    test(`${role} keeps everything typed when the save fails, and can try again`, async ({ page }) => {
      let attempts = 0
      await openWorkspace(page, role, `${basePath}/properties/create`)
      await page.route('**/api/my/properties', async (route) => {
        attempts += 1
        if (attempts <= 2) {
          await route.fulfill({ status: 500, json: { message: 'Your photos could not be uploaded right now. Please try again in a few minutes.', type: 'storage_error' } })
        } else {
          await route.fulfill({ json: { data: { ...draftListing, id: 881, title: `Retry ${role} unit`, status: 'draft' } } })
        }
      })
      const form = new ListingWorkspacePropertyFormPage(page, basePath)
      await fillPropertyForm(page, `Retry ${role} unit`)
      await form.saveDraftButton.click()

      const failure = page.getByRole('alertdialog', { name: 'Couldn’t save your listing' })
      await expect(failure).toContainText('could not be uploaded right now')
      await expect(failure).toContainText('Nothing you typed was lost')
      await failure.getByRole('button', { name: 'Close' }).click()
      await expect(page.locator('#property-title')).toHaveValue(`Retry ${role} unit`)
      await expect(page.locator('#property-barangay')).toHaveValue('Baan KM 3')

      await form.saveDraftButton.click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Try again' }).click()
      await expect(page.getByRole('dialog', { name: 'Draft saved' })).toBeVisible()
      expect(attempts).toBe(3)
    })

    test(`${role} listing form displays required-field validation`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties/create`)
      await new ListingWorkspacePropertyFormPage(page, basePath).submitReviewButton.click()
      await expect(page.getByText(/please fix the \d+ highlighted fields/i)).toBeVisible()
      await expect(page.getByTestId('save-result-dialog')).toBeHidden()
      await expect(page.locator('#property-title')).toBeFocused()
      await expect(page.getByText(/valid Butuan barangay/i)).toBeVisible()
      await expect(page.getByText(/choose the property location on the map/i)).toBeVisible()
    })

    test(`${role} can upload an image and submit a listing for review`, async ({ page }) => {
      let receivedMultipart = false
      await openWorkspace(page, role, `${basePath}/properties/create`)
      await page.route('**/api/my/properties', async (route) => {
        receivedMultipart = route.request().headers()['content-type']?.includes('multipart/form-data') ?? false
        await route.fulfill({ json: { data: { ...listing, id: 880, title: `Review ${role} unit`, status: 'pending', images: [] } } })
      })
      const form = new ListingWorkspacePropertyFormPage(page, basePath)
      await fillPropertyForm(page, `Review ${role} unit`)
      await form.imageInput.setInputFiles({ name: 'listing.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/rWQAAAAASUVORK5CYII=', 'base64') })
      await form.map.click({ position: { x: 120, y: 120 } })
      await form.submitReviewButton.click()
      await expect(page.getByRole('dialog', { name: 'Submitted for review' })).toContainText(`Review ${role} unit`)
      expect(receivedMultipart).toBe(true)
    })

    test(`${role} can edit an existing draft`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties/${draftListing.id}/edit`)
      await expect(page.locator('#property-title')).toHaveValue(draftListing.title)
      await page.locator('#property-title').fill(`Updated ${role} draft`)
      await page.getByRole('button', { name: /save changes/i }).click()
      const dialog = page.getByRole('dialog', { name: 'Changes saved' })
      await expect(dialog).toBeVisible()
      await dialog.getByRole('button', { name: 'OK', exact: true }).click()
      await expect(page).toHaveURL(new RegExp(`${basePath}/properties/${draftListing.id}$`))
    })

    test(`${role} can edit an approved listing and it goes back to review`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties/${listing.id}/edit`)
      await page.route(`**/api/my/properties/${listing.id}`, (route) =>
        route.fulfill({ json: { data: { ...listing, status: 'pending', published_at: null } } }))
      await expect(page.getByRole('note')).toContainText(/back to an administrator for review/i)
      await page.locator('#property-title').fill(`Updated ${role} live listing`)
      await page.locator('#property-barangay').fill('Baan KM 3')
      await page.getByRole('button', { name: /save changes/i }).click()
      await expect(page.getByRole('dialog', { name: 'Changes saved' })).toContainText(/sent to an administrator for review/i)
    })

    test(`${role} can delete an approved listing after a warning`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties`)
      let confirmation = ''
      page.once('dialog', (dialog) => {
        confirmation = dialog.message()
        void dialog.accept()
      })
      await page.getByRole('button', { name: `Delete ${listing.title}` }).click()
      await expect(page.getByRole('status').filter({ hasText: /deleted/i })).toContainText(/deleted/i)
      expect(confirmation).toMatch(/live and will be removed from the public site/i)
    })

    test(`${role} can view listing details and return to the list`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties/${draftListing.id}`)
      const details = new ListingWorkspacePropertyDetailsPage(page, basePath)
      await expect(details.heading).toHaveText('Property Details')
      await expect(page.getByText(draftListing.title)).toBeVisible()
      await details.backLink.click()
      await expect(page).toHaveURL(new RegExp(`${basePath}/properties$`))
    })

    test(`${role} can confirm deletion of a draft listing`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/properties`)
      page.once('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: `Delete ${draftListing.title}` }).click()
      await expect(page.getByRole('status').filter({ hasText: /deleted/i })).toContainText(/deleted/i)
      await expect(page.getByText(draftListing.title)).toHaveCount(0)
    })

    test(`${role} can reply to a listing inquiry`, async ({ page }) => {
      await openWorkspace(page, role, `${basePath}/inquiries`)
      const inquiries = new ListingWorkspaceInquiriesPage(page, basePath)
      await expect(page.getByText(users.buyer.name)).toBeVisible()
      await page.getByRole('button', { name: new RegExp(`View inquiry from ${users.buyer.name}`, 'i') }).click()
      await inquiries.conversationButtons.click()
      await inquiries.replyInput.fill('I can arrange a viewing on Friday.')
      await page.locator('.conversation-panel').getByRole('button', { name: /^send$/i }).click()
      await expect(page.locator('.conversation-panel')).toContainText('I can arrange a viewing on Friday.')
    })
  })
}

test('owner dashboard has no axe violations', async ({ page }) => {
  await openWorkspace(page, 'owner', '/owner/dashboard')
  await expectNoAxeViolations(page)
})

test('old developer links redirect to the owner workspace', async ({ page }) => {
  await openWorkspace(page, 'owner', '/developer/properties/103')
  await expect(page).toHaveURL(/\/owner\/properties\/103$/)
})

test('owner listings table shows review and availability colours with a legend', async ({ page }) => {
  await openWorkspace(page, 'owner', '/owner/properties')
  const legend = page.getByTestId('listing-status-legend')
  await expect(legend).toContainText('Pending review')
  await expect(legend).toContainText('Reserved')
  await expect(page.getByTestId('review-status').first()).toBeVisible()
  await expect(page.getByTestId('availability-badge').first()).toContainText('Available')
})

test('listing inquiry page supports empty and load-error states', async ({ page }) => {
  await openWorkspace(page, 'owner', '/owner/inquiries', {
    'GET my/inquiries': { scenario: 'empty' },
    'GET my/properties': { scenario: 'empty' },
  })
  await expect(page.getByText(/no inquiries/i)).toBeVisible()
  expect(listing.id).toBe(101)
})