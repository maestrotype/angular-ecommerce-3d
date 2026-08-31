import { defineConfig, devices } from '@playwright/test';

/**
 * Listing gallery capture. Does not start a server — point at a running app.
 * Default: http://localhost:4200  · override: SCREENSHOT_BASE_URL
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/capture-screenshots.spec.ts',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env['SCREENSHOT_BASE_URL'] || 'http://localhost:4200',
    trace: 'off',
  },
  projects: [{ name: 'chromium' }],
});
