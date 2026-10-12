
import { test, expect, type Page } from '@playwright/test'

const BASE_PATH = '/broker/listings'

async function fillListingForm(
  page: Page,
  details: {
    title: string
    location?: string
    barangay?: string
    price?: string
    area?: string
    description?: string
  }
) {
  await page.locator('#broker-title').fill(details.title)

  if (details.location !== undefined) {
    await page.locator('#broker-location').fill(details.location)
  }

  if (details.barangay !== undefined) {
    await page.locator('#broker-barangay').fill(details.barangay)
  }

  if (details.price !== undefined) {
    await page.locator('#broker-price').fill(details.price)
  }

  if (details.area !== undefined) {
    await page.locator('#broker-area').fill(details.area)
  }

  if (details.description !== undefined) {
    await page.locator('#broker-description').fill(
      details.description
    )
  }
}

test.describe('Broker Listing Workflow', () => {
  test('creates, edits, views, and persists a Draft listing', async ({
    page
  }) => {
    const originalTitle = 'Playwright Draft Listing'
    const updatedTitle = 'Playwright Updated Listing'

    // CREATE DRAFT
    await page.goto(`${BASE_PATH}/create`)

    await expect(
      page.getByRole('heading', {
        name: 'Add New Listing'
      })
    ).toBeVisible()

    await fillListingForm(page, {
      title: originalTitle,
      location: 'Butuan City',
      barangay: 'Ampayon',
      price: '25000',
      area: '120',
      description: 'Automated Broker listing test.'
    })

    await page.getByRole('button', {
      name: 'Save Draft'
    }).click()

    // CREATE PAGE REDIRECTS TO LISTING DETAILS
    await expect(page).toHaveURL(
      /\/broker\/listings\/\d+$/
    )

    const detailsUrl = page.url()

    await expect(
      page.getByRole('heading', {
        name: originalTitle
      })
    ).toBeVisible()

    await expect(
      page.getByText('Status: Draft')
    ).toBeVisible()

    // VERIFY IN MY LISTINGS
    await page.goto(BASE_PATH)

    await expect(
      page.getByText(originalTitle)
    ).toBeVisible()

    // EDIT THE DRAFT
    await page.goto(detailsUrl)

    await page.getByRole('link', {
      name: 'Edit Draft'
    }).click()

    await expect(
      page.getByRole('heading', {
        name: 'Edit Listing'
      })
    ).toBeVisible()

    await expect(
      page.locator('#broker-title')
    ).toHaveValue(originalTitle)

    await page.locator('#broker-title').fill(
      updatedTitle
    )

    await page.locator('#broker-price').fill('30000')

    await page.getByRole('button', {
      name: 'Save Changes'
    }).click()

    // VERIFY UPDATE
    await expect(page).toHaveURL(detailsUrl)

    await expect(
      page.getByRole('heading', {
        name: updatedTitle
      })
    ).toBeVisible()

    await expect(
      page.getByText('₱30,000')
    ).toBeVisible()

    // VERIFY DATA PERSISTS AFTER RELOAD
    await page.reload()

    await expect(
      page.getByRole('heading', {
        name: updatedTitle
      })
    ).toBeVisible()

    await expect(
      page.getByText('Status: Draft')
    ).toBeVisible()

    // VERIFY NO DUPLICATE LISTINGS
    await page.goto(BASE_PATH)

    await expect(
      page.getByText(updatedTitle)
    ).toHaveCount(1)

    await expect(
      page.getByText(originalTitle)
    ).toHaveCount(0)
  })

  test('submits a complete listing for review', async ({
    page
  }) => {
    const title = 'Playwright Pending Listing'

    await page.goto(`${BASE_PATH}/create`)

    await fillListingForm(page, {
      title,
      location: 'Butuan City',
      barangay: 'Libertad',
      price: '40000',
      area: '200',
      description:
        'Automated review submission test.'
    })

    await page.getByRole('button', {
      name: 'Submit for Review'
    }).click()

    await expect(page).toHaveURL(
      /\/broker\/listings\/\d+$/
    )

    await expect(
      page.getByRole('heading', {
        name: title
      })
    ).toBeVisible()

    await expect(
      page.getByText('Status: Pending')
    ).toBeVisible()

    // PENDING LISTINGS CANNOT BE EDITED
    await expect(
      page.getByRole('link', {
        name: 'Edit Draft'
      })
    ).toHaveCount(0)

    // STATUS SURVIVES RELOAD
    await page.reload()

    await expect(
      page.getByText('Status: Pending')
    ).toBeVisible()
  })

  test('prevents incomplete listings from being submitted', async ({
    page
  }) => {
    await page.goto(`${BASE_PATH}/create`)

    await page.locator('#broker-title').fill(
      'Incomplete Broker Listing'
    )

    await page.getByRole('button', {
      name: 'Submit for Review'
    }).click()

    await expect(
      page.getByRole('alert')
    ).toContainText(
      'Complete the location, barangay, description, price, and area'
    )

    // USER MUST REMAIN ON THE FORM
    await expect(page).toHaveURL(
      /\/broker\/listings\/create$/
    )
  })

  test('requires a property title before saving a Draft', async ({
    page
  }) => {
    await page.goto(`${BASE_PATH}/create`)

    await page.getByRole('button', {
      name: 'Save Draft'
    }).click()

    await expect(
      page.getByRole('alert')
    ).toContainText('Property title is required.')

    await expect(page).toHaveURL(
      /\/broker\/listings\/create$/
    )
  })
})
