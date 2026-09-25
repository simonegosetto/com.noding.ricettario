import { defineConfig, devices } from '@playwright/test';

/**
 * Test end-to-end con il backend PHP simulato (e2e/support/backend.ts): nessuna richiesta
 * raggiunge la produzione. `npm run e2e` avvia `ng serve -c e2e` sulla porta 4300.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npx ng serve --configuration e2e --port 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
