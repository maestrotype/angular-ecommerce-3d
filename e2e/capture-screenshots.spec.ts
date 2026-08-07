/**
 * Marketplace screenshot batch capture.
 *
 * Prerequisites:
 *   Terminal 1: cd backend && npm run start:dev
 *   Terminal 2: npm start
 *   Optional: cd backend && npm run seed && curl -X POST http://localhost:3002/api/auth/create-admin
 *
 * Run: npm run screenshots:capture
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env['SCREENSHOT_BASE_URL'] || 'http://localhost:4200';
const ROOT = path.join(__dirname, '..', 'screenshots');

const THEMES = ['light', 'dark', 'glass'] as const;

function outDir(...segments: string[]) {
  const dir = path.join(ROOT, ...segments);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function setTheme(page: import('@playwright/test').Page, theme: string) {
  await page.evaluate((id) => {
    localStorage.setItem('selected-theme', id);
    document.documentElement.setAttribute('data-theme', id);
    document.body.setAttribute('data-theme', id);
  }, theme);
  await page.waitForTimeout(400);
}

test.describe.configure({ mode: 'serial' });

test.describe('Marketplace screenshots', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('desktop — homepage themes', async ({ page }) => {
    const dir = outDir('desktop');
    for (const theme of THEMES) {
      await page.goto(`${BASE}/`);
      await setTheme(page, theme);
      await expect(page.locator('app-header')).toBeVisible({ timeout: 15_000 });
      await page.screenshot({
        path: path.join(dir, `0${THEMES.indexOf(theme) + 1}-homepage-${theme}.png`),
        fullPage: false,
      });
    }
  });

  test('desktop — shop and product', async ({ page }) => {
    const dir = outDir('desktop');
    await page.goto(`${BASE}/shop`);
    await setTheme(page, 'light');
    await expect(page.locator('app-three-d-viewer')).toBeVisible({ timeout: 15_000 });
    await page.screenshot({ path: path.join(dir, '04-shop-page.png') });

    const productLink = page.locator('app-product-card a, .product-card a').first();
    if (await productLink.count()) {
      await productLink.click();
      await page.waitForURL(/\/product\//, { timeout: 10_000 }).catch(() => undefined);
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(dir, '05-product-page.png'), fullPage: false });
    }
  });

  test('desktop — cart and checkout routes', async ({ page }) => {
    const dir = outDir('desktop');
    await page.goto(`${BASE}/checkout`);
    await setTheme(page, 'light');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(dir, '06-checkout-page.png'), fullPage: false });
  });

  test('mobile — key pages', async ({ page }) => {
    const dir = outDir('mobile');
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE}/`);
    await setTheme(page, 'light');
    await page.screenshot({ path: path.join(dir, 'mobile-01-homepage.png') });

    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(dir, 'mobile-02-shop.png') });
  });

  test('admin — login page', async ({ page }) => {
    const dir = outDir('admin');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE}/admin/login`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(dir, 'admin-01-login.png'), fullPage: false });
  });
});
