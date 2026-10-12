
import { chromium } from '@playwright/test'

const browser = await chromium.launch({
  headless: true
})

const page = await browser.newPage({
  viewport: {
    width: 1440,
    height: 900
  },
  deviceScaleFactor: 1
})

const pages = [
  { name: '01-home', url: '/' },
  { name: '02-properties', url: '/properties' },
  { name: '03-property-details', url: '/properties/1' },
  { name: '04-login', url: '/login' },
  { name: '05-register', url: '/register' },
  { name: '06-forgot-password', url: '/forgot-password' },
  { name: '07-owner-dashboard', url: '/owner/dashboard' },
  { name: '08-my-properties', url: '/owner/properties' }
]

for (const item of pages) {
  console.log(`Capturing ${item.name}...`)

  await page.goto(`http://localhost:5173${item.url}`, {
    waitUntil: 'networkidle'
  })

  await page.screenshot({
    path: `screenshots/${item.name}.png`,
    fullPage: true,
    animations: 'disabled'
  })

  console.log(`Saved screenshots/${item.name}.png`)
}

await browser.close()

console.log('All screenshots captured!')
