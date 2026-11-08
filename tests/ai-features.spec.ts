import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'

const evidenceDirectory = resolve(process.cwd(), 'test-results/ai-evidence')
const backendDirectory = resolve(process.cwd(), '../backend')
const frontendOrigin = 'http://127.0.0.1:4174'
const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const temporaryListingTitle = `AI E2E warehouse ${runId}`
const inquiryMarker = `AI-E2E-${runId}`
const ownerEmail = 'owner1@local.test'
const buyerEmail = 'buyer@local.test'
const seededPassword = 'password'
const publishedPropertyId = 21

let createdListingId: number | null = null

mkdirSync(evidenceDirectory, { recursive: true })

test.describe('live local DeepSeek features', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Run live API-backed evidence in Chromium only.')
  test.setTimeout(120_000)

  test.afterAll(() => {
    const phpTitle = JSON.stringify(temporaryListingTitle)
    const phpMarker = JSON.stringify(inquiryMarker)
    const cleanup = `
      $connection = config('database.default');
      $host = config("database.connections.{$connection}.host");
      if (! app()->environment('local') || ! in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
          throw new RuntimeException('Refusing to clean up against a non-local database.');
      }
      $inquiry = App\\Models\\Inquiry::where('message', 'like', '%' . ${phpMarker} . '%')->first();
      if ($inquiry) {
          $inquiry->messages()->delete();
          $inquiry->delete();
      }
      $property = App\\Models\\Property::where('title', ${phpTitle})
          ->whereHas('owner', fn ($query) => $query->where('email', ${JSON.stringify(ownerEmail)}))
          ->first();
      if ($property) {
          $property->images()->delete();
          $property->delete();
      }
      dump(['temporary_inquiry_remaining' => App\\Models\\Inquiry::where('message', 'like', '%' . ${phpMarker} . '%')->exists(), 'temporary_listing_remaining' => App\\Models\\Property::where('title', ${phpTitle})->exists()]);
    `

    execFileSync('php', ['artisan', 'tinker', '--execute', cleanup], {
      cwd: backendDirectory,
      stdio: 'pipe',
    })
  })

  async function capture(page: Page, filename: string, selector?: string) {
    const path = resolve(evidenceDirectory, filename)
    try {
      if (selector) {
        await page.locator(selector).screenshot({ path, animations: 'disabled' })
      } else {
        await page.screenshot({ path, fullPage: true, animations: 'disabled' })
      }
    } catch {
      // Preserve the original feature assertion if the browser closed after a timeout.
    }
  }

  async function login(page: Page, email: string, destination: string) {
    await page.goto(`${frontendOrigin}/login`)
    await page.locator('#login-email').fill(email)
    await page.locator('#login-password').fill(seededPassword)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL((url) => url.pathname !== '/login', { timeout: 15_000 })
    await page.goto(`${frontendOrigin}${destination}`)
  }

  async function chooseSelect(page: Page, selector: string, option: string) {
    await page.locator(selector).click()
    await page.getByRole('option', { name: option, exact: true }).click()
  }

  test('AI description generator returns generated property copy', async ({ page }) => {
    await login(page, ownerEmail, '/owner/properties/create')
    await page.locator('#property-title').fill('Butuan City high-ceiling commercial warehouse')
    await chooseSelect(page, '#property-type', 'Warehouses')
    await chooseSelect(page, '#listing-type', 'For Rent')
    await page.locator('#property-barangay').fill('Baan KM 3')
    await page.locator('#property-location').fill('J.C. Aquino Avenue')
    await page.locator('#property-price').fill('35000')
    await page.locator('#property-area').fill('300')

    await capture(page, 'ai-description-before-click.png')

    try {
      await page.getByRole('button', { name: 'Generate Description' }).click()
      await expect.poll(async () => (await page.locator('#property-description').inputValue()).trim().split(/\s+/).filter(Boolean).length, { timeout: 30_000 }).toBeGreaterThan(50)
      await expect(page.getByText(/AI service error|not configured|temporarily unavailable/i)).toHaveCount(0)
      await capture(page, 'ai-description-after-response.png')
      const description = await page.locator('#property-description').inputValue()
      console.info(`[AI DESCRIPTION] ${description.slice(0, 500)}`)
      expect(description.trim().split(/\s+/).filter(Boolean).length).toBeGreaterThan(50)
    } catch (error) {
      await capture(page, 'ai-description-failure.png')
      throw error
    }
  })

  test('AI tagging runs on listing creation and stores three to six tags', async ({ page }) => {
    await login(page, ownerEmail, '/owner/properties/create')
    await page.locator('#property-title').fill(temporaryListingTitle)
    await chooseSelect(page, '#property-type', 'Warehouses')
    await chooseSelect(page, '#listing-type', 'For Rent')
    await page.locator('#property-barangay').fill('Baan KM 3')
    await page.locator('#property-location').fill('J.C. Aquino Avenue, Butuan City')
    await page.locator('#property-price').fill('35000')
    await page.locator('#property-area').fill('300')
    await page.locator('#property-description').fill('A 300 square meter high-ceiling commercial warehouse near J.C. Aquino Avenue in Butuan City, suitable for storage and local distribution.')

    try {
      const createResponse = page.waitForResponse((response) => {
        const request = response.request()
        return new URL(response.url()).pathname.endsWith('/api/my/properties') && request.method() === 'POST'
      }, { timeout: 45_000 })
      await page.getByRole('button', { name: 'Save Draft' }).click()
      const response = await createResponse
      expect(response.ok(), `Listing create returned HTTP ${response.status()}`).toBeTruthy()
      const payload = await response.json() as { data?: { id?: number; ai_tags?: string[] }; message?: string }
      createdListingId = payload.data?.id ?? null
      const tags = payload.data?.ai_tags ?? []
      expect(createdListingId, 'The listing create response should contain the new ID.').toBeTruthy()
      expect(tags.length, `AI tags returned: ${JSON.stringify(tags)}`).toBeGreaterThanOrEqual(3)
      expect(tags.length).toBeLessThanOrEqual(6)
      expect(tags.every((tag) => typeof tag === 'string' && tag.length > 0)).toBeTruthy()
      await expect(page.getByText('Draft Saved', { exact: true })).toBeVisible()
      await page.getByRole('link', { name: 'View My Properties' }).click()
      await page.getByRole('link', { name: `View details of ${temporaryListingTitle}` }).click()
      await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible()
      await expect(page.getByText(temporaryListingTitle)).toBeVisible()
      await capture(page, 'ai-tagging-listing-detail.png')
      console.info(`[AI TAGGING] ${temporaryListingTitle}: ${tags.join(', ')}`)

      // The current property detail/card UI does not render tag badges. The create response
      // from the real UI-triggered request is the authoritative visible evidence for ai_tags.
      await page.goto(`${frontendOrigin}/owner/properties`)
      await expect(page.getByRole('heading', { name: 'My Properties' })).toBeVisible()
      page.once('dialog', (dialog) => dialog.accept())
      await page.getByRole('button', { name: `Delete ${temporaryListingTitle}` }).click()
      await expect(page.getByText(temporaryListingTitle)).toHaveCount(0)
      createdListingId = null
    } catch (error) {
      await capture(page, 'ai-tagging-failure.png')
      throw error
    }
  })

  test('AI inquiry scoring returns and displays a summary and priority', async ({ page }) => {
    page.on('pageerror', (error) => console.error(`[AI INQUIRY PAGE ERROR] ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') console.error(`[AI INQUIRY BROWSER ERROR] ${message.text()}`)
    })
    const message = `${inquiryMarker}: I have a PHP 500,000 monthly budget, need a commercial office in Butuan City with at least 100 square meters, and want to begin a 12-month lease next month. I would like to arrange a viewing this week.`
    console.info('[AI INQUIRY] logging in as buyer')
    await login(page, buyerEmail, `/properties/${publishedPropertyId}`)
    console.info('[AI INQUIRY] published detail loaded')
    await page.locator('#inquiry-name').fill('Local AI Test Buyer')
    await page.locator('#inquiry-email').fill('buyer@local.test')
    await page.locator('#inquiry-message').fill(message)

    try {
      const inquiryResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname.endsWith(`/api/properties/${publishedPropertyId}/inquiries`) && response.request().method() === 'POST',
      { timeout: 45_000 })
      await page.getByRole('button', { name: 'Send Inquiry' }).click()
      const response = await inquiryResponse
      console.info(`[AI INQUIRY] submit returned HTTP ${response.status()}`)
      expect(response.ok(), `Inquiry submit returned HTTP ${response.status()}`).toBeTruthy()
      const payload = await response.json() as { data?: { id: number; ai_summary: string | null; ai_priority: string } }
      expect(payload.data?.ai_summary?.trim()).toBeTruthy()
      expect(['high', 'medium', 'low']).toContain(payload.data?.ai_priority)

      console.info('[AI INQUIRY] signing out buyer')
      await page.getByRole('button', { name: 'Sign Out' }).click()
      console.info('[AI INQUIRY] logging in as owner')
      await login(page, ownerEmail, '/owner/inquiries')
      console.info(`[AI INQUIRY] owner page URL ${page.url()}`)
      await expect(page).toHaveURL(/\/owner\/inquiries$/)
      await expect(page.getByRole('heading', { name: 'Inquiry Management' })).toBeVisible()
      console.info('[AI INQUIRY] owner inbox loaded; filling search')
      await page.getByPlaceholder('Search inquiries...').fill(inquiryMarker)
      await page.getByRole('button', { name: /view inquiry from local ai test buyer/i }).click()
      console.info('[AI INQUIRY] details opened')
      const details = page.getByRole('dialog', { name: 'Inquiry Details' })
      await expect(details.getByText(payload.data!.ai_summary!, { exact: true })).toBeVisible()
      await expect(page.getByText(payload.data!.ai_priority!, { exact: true })).toBeVisible()
      await capture(page, 'ai-inquiry-scoring-summary-priority.png')
      console.info(`[AI INQUIRY SCORING] ${payload.data!.ai_summary} | ${payload.data!.ai_priority}`)
    } catch (error) {
      await capture(page, 'ai-inquiry-scoring-failure.png')
      throw error
    }
  })

  test('AI natural-language search returns a summary and results state', async ({ page }) => {
    await page.goto(`${frontendOrigin}/properties`)
    await expect(page.getByRole('heading', { name: 'Explore Commercial Properties' })).toBeVisible()

    try {
      await page.locator('#ai-property-query').fill('commercial space in Butuan under 40000')
      await page.getByRole('button', { name: 'Search with AI' }).click()
      const summary = page.locator('.ai-results .summary')
      await expect(summary).toBeVisible({ timeout: 30_000 })
      const summaryText = (await summary.innerText()).trim()
      expect(summaryText.length).toBeGreaterThan(20)
      expect(summaryText).not.toMatch(/not configured|AI service error/i)
      await capture(page, 'ai-natural-language-search-results.png')
      console.info(`[AI SEARCH] ${summaryText.slice(0, 500)}`)
    } catch (error) {
      await capture(page, 'ai-natural-language-search-failure.png')
      throw error
    }
  })

  test('AI market insight loads and refreshes a two to four sentence summary', async ({ page }) => {
    await login(page, ownerEmail, '/owner/dashboard')
    const widget = page.locator('.market-insight-widget')
    const summary = widget.locator('.summary')

    try {
      await expect(summary).toBeVisible({ timeout: 30_000 })
      const initialText = (await summary.innerText()).trim()
      expect(initialText).not.toMatch(/not configured|AI service error/i)
      const sentenceCount = (initialText.match(/[.!?](?:\s|$)/g) ?? []).length
      expect(sentenceCount, `Market insight sentence count ${sentenceCount}: ${initialText}`).toBeGreaterThanOrEqual(2)
      expect(sentenceCount).toBeLessThanOrEqual(4)
      expect(initialText).toMatch(/listing|price|PHP|₱|office|warehouse|retail|commercial/i)
      await capture(page, 'ai-market-insight-initial.png', '.market-insight-widget')
      console.info(`[AI MARKET INSIGHT] ${initialText.slice(0, 500)}`)

      const refresh = widget.getByRole('button', { name: 'Refresh market insights' })
      await refresh.click()
      await expect(refresh).toBeEnabled({ timeout: 30_000 })
      await expect(summary).toBeVisible()
      const refreshedText = (await summary.innerText()).trim()
      expect(refreshedText).not.toMatch(/not configured|AI service error/i)
      await capture(page, 'ai-market-insight-refreshed.png', '.market-insight-widget')
      console.info(`[AI MARKET INSIGHT REFRESH] ${refreshedText.slice(0, 500)}`)
    } catch (error) {
      await capture(page, 'ai-market-insight-failure.png', '.market-insight-widget').catch(async () => capture(page, 'ai-market-insight-failure.png'))
      throw error
    }
  })
})
