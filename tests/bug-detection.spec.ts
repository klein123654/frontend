
import { test, expect } from '@playwright/test'
import { mockPublicPropertyApi } from './api-mocks'

const baseURL = 'http://127.0.0.1:4174'

const routes = [
  '/',
  '/properties',
  '/properties/1',
  '/properties/2',
  '/properties/3',
  '/properties/4'
]

for (const route of routes) {
  test(`detect errors on ${route}`, async ({ page }) => {
    await mockPublicPropertyApi(page)
    const errors: string[] = []

    // Detect JavaScript runtime errors
    page.on('pageerror', (error) => {
      errors.push(`JavaScript: ${error.message}`)
    })

    // Detect browser console errors
    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`Console: ${message.text()}`)
      }
    })

    // Detect failed HTTP responses from local assets
    page.on('response', (response) => {
      const url = response.url()

      if (
        response.status() >= 400 &&
        url.startsWith(baseURL)
      ) {
        errors.push(
          `HTTP ${response.status()}: ${url}`
        )
      }
    })

    // Open page
    const response = await page.goto(`${baseURL}${route}`)

    expect(response?.status()).toBeLessThan(400)

    // Check broken images
    await page.locator('img').evaluateAll(async (images) => {
      await Promise.all(
        images.map(async (image) => {
          const img = image as HTMLImageElement

          if (!img.complete) {
            await new Promise<void>((resolve) => {
              img.addEventListener('load', () => resolve(), {
                once: true
              })
              img.addEventListener('error', () => resolve(), {
                once: true
              })
              setTimeout(resolve, 5000)
            })
          }
        })
      )
    })

    const brokenImages = await page.locator('img').evaluateAll(
      (images) =>
        images
          .filter(
            (image) =>
              (image as HTMLImageElement).naturalWidth === 0
          )
          .map((image) => (image as HTMLImageElement).src)
    )

    for (const src of brokenImages) {
      errors.push(`Broken image: ${src}`)
    }

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        window.innerWidth + 2
      )
    })

    if (hasOverflow) {
      errors.push('Horizontal overflow detected')
    }

    // Print errors to terminal and HTML report
    if (errors.length > 0) {
      console.log(`\nErrors detected on ${route}:`)
      errors.forEach((error) => console.log(`- ${error}`))
    }

    expect(
      errors,
      `Detected problems on ${route}`
    ).toEqual([])
  })
}
