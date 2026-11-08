import { defineConfig, devices } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4174'

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 30_000,
  expect: { timeout: 7_500 },
  retries: process.env.CI ? 1 : 0,
  fullyParallel: true,
  reporter: [
    ['list'],
    ['json', { outputFile: './test-results/results.json' }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  webServer: {
    command: 'npm run build && npx vite preview --host 127.0.0.1 --port 4174 --strictPort',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', workers: 3, use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
})
