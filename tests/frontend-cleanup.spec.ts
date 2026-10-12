import { expect, test, type Page } from '@playwright/test'

const demoPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAMAAAADCAIAAADZSiLoAAAAF0lEQVR4nGN88OkfAwMDAwMDEwMMIFgATxoC1kIHKrEAAAAASUVORK5CYII=',
  'base64'
)

async function createOwnerDraft(page: Page, title: string, photo = false): Promise<number> {
  await page.goto('/owner/properties/create')
  await page.locator('#property-title').fill(title)
  if (photo) {
    await page.locator('#property-images').setInputFiles({
      name: 'automated-demo-photo.png', mimeType: 'image/png', buffer: demoPng
    })
  }
  await page.getByRole('button', { name: 'Save Draft' }).click()
  await expect(page.getByText('Draft Saved Locally')).toBeVisible()
  const record = page.locator('.record-reference')
  await expect(record).toContainText(/Demo Listing #\d+/)
  const match = (await record.innerText()).match(/#(\d+)/)
  if (!match) throw new Error('Owner listing ID was not displayed.')
  return Number(match[1])
}

async function createBrokerPending(page: Page, title: string): Promise<number> {
  await page.goto('/broker/listings/create')
  await page.locator('#broker-title').fill(title)
  await page.locator('#broker-location').fill('Butuan City')
  await page.locator('#broker-barangay').fill('Libertad')
  await page.locator('#broker-price').fill('32000')
  await page.locator('#broker-area').fill('150')
  await page.locator('#broker-description').fill('Automated browser catalogue test.')
  await page.getByRole('button', { name: 'Submit for Review' }).click()
  await expect(page).toHaveURL(/\/broker\/listings\/\d+$/)
  const match = page.url().match(/\/(\d+)$/)
  if (!match) throw new Error('Broker listing ID was not displayed.')
  return Number(match[1])
}

test.describe('Pre-Laravel frontend cleanup', () => {
  test('Owner Draft creation, editing and refresh retain details', async ({ page }) => {
    const id = await createOwnerDraft(page, 'Owner Cleanup Draft')
    await page.goto(`/owner/properties/${id}/edit`)
    await expect(page.locator('#property-title')).toHaveValue('Owner Cleanup Draft')
    await page.locator('#property-title').fill('Owner Updated Draft')
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await expect(page.getByText('Changes Saved')).toBeVisible()
    await page.reload()
    await expect(page.locator('#property-title')).toHaveValue('Owner Updated Draft')
    await page.goto(`/owner/properties/${id}`)
    await expect(page.getByText('Owner Updated Draft')).toBeVisible()
  })

  test('Owner photo is compressed and persists after refresh', async ({ page }) => {
    const id = await createOwnerDraft(page, 'Owner Image Persistence', true)
    await page.goto(`/owner/properties/${id}`)
    const photo = page.locator('.property-image-container img')
    await expect(photo).toHaveAttribute('src', /^data:image\/jpeg;base64,/)
    await page.reload()
    await expect(page.locator('.property-image-container img')).toHaveAttribute('src', /^data:image\/jpeg;base64,/)
  })

  test('Owner cannot submit an incomplete Draft for review', async ({ page }) => {
    const id = await createOwnerDraft(page, 'Owner Incomplete Draft')
    await page.goto(`/owner/properties/${id}/edit`)
    await page.getByRole('button', { name: 'Submit for Review' }).click()
    await expect(page.getByRole('alert')).toContainText('Please correct the highlighted fields')
    await expect(page).toHaveURL(new RegExp(`/owner/properties/${id}/edit$`))
  })

  test('Owner complete Draft can be submitted for review', async ({ page }) => {
    const id = await createOwnerDraft(page, 'Owner Ready For Review', true)
    await page.goto(`/owner/properties/${id}/edit`)
    await page.locator('.property-form .p-select').nth(0).click()
    await page.getByRole('option', { name: 'Office Spaces' }).click()
    await page.locator('.property-form .p-select').nth(1).click()
    await page.getByRole('option', { name: 'For Rent' }).click()
    await page.locator('#property-barangay').fill('Libertad')
    await page.locator('#property-location').fill('Butuan City')
    await page.locator('#property-price').fill('28000')
    await page.locator('#property-area').fill('95')
    await page.locator('#property-description').fill('Commercial space ready for administrative review.')
    await page.getByRole('button', { name: 'Submit for Review' }).click()
    await expect(page).toHaveURL(new RegExp(`/owner/properties/${id}$`))
    await expect(page.locator('.status-badge')).toContainText('Pending')
    await page.reload()
    await expect(page.locator('.status-badge')).toContainText('Pending')
  })

  test('Broker Draft can be completed and submitted from Edit', async ({ page }) => {
    await page.goto('/broker/listings/create')
    await page.locator('#broker-title').fill('Broker Draft To Pending')
    await page.getByRole('button', { name: 'Save Draft' }).click()
    await expect(page).toHaveURL(/\/broker\/listings\/\d+$/)
    const details = page.url()
    await page.getByRole('link', { name: 'Edit Draft' }).click()
    await page.locator('#broker-location').fill('Butuan City')
    await page.locator('#broker-barangay').fill('Libertad')
    await page.locator('#broker-price').fill('45000')
    await page.locator('#broker-area').fill('200')
    await page.locator('#broker-description').fill('Ready for administrative review.')
    await page.getByRole('button', { name: 'Submit for Review' }).click()
    await expect(page).toHaveURL(details)
    await expect(page.getByText('Status: Pending')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Edit Draft' })).toHaveCount(0)
    await page.reload()
    await expect(page.getByText('Status: Pending')).toBeVisible()
  })

  test('Admin approval publishes an existing Broker listing only in this browser', async ({ page }) => {
    const title = 'Broker Admin Published Listing'
    const id = await createBrokerPending(page, title)
    await page.goto('/properties')
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
    await page.goto('/admin/properties')
    await page.getByRole('button', { name: `Review ${title}` }).click()
    await page.getByRole('button', { name: 'Approve Listing' }).click()
    await expect(page.getByRole('status')).toContainText('Demo decision saved: Approved.')
    await page.goto(`/broker/listings/${id}`)
    await expect(page.getByText('Status: Approved')).toBeVisible()
    await page.goto('/properties')
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await page.getByRole('link', { name: new RegExp(title) }).click()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
  })

  test('Admin rejection does not publish a Broker listing', async ({ page }) => {
    const title = 'Broker Admin Rejected Listing'
    const id = await createBrokerPending(page, title)
    await page.goto('/admin/properties')
    await page.getByRole('button', { name: `Review ${title}` }).click()
    await page.locator('#admin-review-note').fill('Incomplete supporting information')
    await page.getByRole('button', { name: 'Reject Listing' }).click()
    await page.goto(`/broker/listings/${id}`)
    await expect(page.getByText('Status: Rejected')).toBeVisible()
    await page.goto('/properties')
    await expect(page.getByRole('heading', { name: title })).toHaveCount(0)
  })
})
