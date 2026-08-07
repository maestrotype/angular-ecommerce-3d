import { defineConfig, devices } from '@playwright/test';

const ci = !!process.env['CI'];
const port = ci ? 4200 : 4000;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
    testDir: './e2e',
    testIgnore: ['**/capture-screenshots.spec.ts'],
    fullyParallel: !ci,
    forbidOnly: ci,
    retries: ci ? 2 : 0,
    workers: ci ? 1 : undefined,
    reporter: ci ? [['github'], ['list']] : 'html',
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    projects: ci
        ? [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
        : [
            { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
            { name: 'webkit', use: { ...devices['Desktop Safari'] } },
        ],
    webServer: {
        command: ci
            ? 'npx ng serve --port 4200 --host 127.0.0.1'
            : 'npm run serve:ssr:dev',
        url: baseURL,
        reuseExistingServer: !ci,
        timeout: ci ? 180_000 : 300_000,
    },
});
