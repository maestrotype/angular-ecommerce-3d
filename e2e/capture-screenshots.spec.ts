/**
 * Marketplace screenshot batch (listing gallery).
 *
 * Prerequisites:
 *   Terminal 1: npm run backend:start:dev
 *   Terminal 2: npm start
 *   Seeded catalog recommended: npm run backend:seed
 *
 * Optional admin shots (dashboard / products / sections):
 *   ADMIN_SCREENSHOT_EMAIL / ADMIN_SCREENSHOT_PASSWORD
 *
 * Run: npm run screenshots:capture
 */
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const BASE = process.env['SCREENSHOT_BASE_URL'] || 'http://localhost:4200';
const ROOT = path.join(__dirname, '..', 'screenshots');
const ADMIN_EMAIL = process.env['ADMIN_SCREENSHOT_EMAIL'] || '';
const ADMIN_PASSWORD = process.env['ADMIN_SCREENSHOT_PASSWORD'] || '';

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

async function waitForStorefront(page: import('@playwright/test').Page) {
  await expect(page.locator('app-root')).toBeVisible({ timeout: 15_000 });
  await page
    .locator('app-video-hero, app-hero, app-product-card, .product-card')
    .first()
    .waitFor({ state: 'visible', timeout: 12_000 })
    .catch(() => undefined);
  await page.waitForTimeout(600);
}

async function shot(
  page: import('@playwright/test').Page,
  dir: string,
  name: string,
) {
  await page.screenshot({ path: path.join(dir, name), fullPage: false });
}

test.describe.configure({ mode: 'serial' });

test.describe('Marketplace screenshots', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('desktop — homepage themes', async ({ page }) => {
    const dir = outDir('desktop');
    for (const theme of THEMES) {
      await page.goto(`${BASE}/`);
      await setTheme(page, theme);
      await waitForStorefront(page);
      await shot(page, dir, `0${THEMES.indexOf(theme) + 1}-homepage-${theme}.png`);
    }
  });

  test('desktop — shop, product, cart, checkout', async ({ page }) => {
    const dir = outDir('desktop');
    await page.goto(`${BASE}/shop`);
    await setTheme(page, 'light');
    await waitForStorefront(page);
    await shot(page, dir, '04-shop-page.png');

    const productLink = page.locator('app-product-card a, .product-card a, a[href*="/product/"]').first();
    if (await productLink.count()) {
      await productLink.click();
      await page.waitForURL(/\/product\//, { timeout: 10_000 }).catch(() => undefined);
      await page.waitForTimeout(1500);
      await shot(page, dir, '05-product-page.png');
    }

    await page.goto(`${BASE}/favorites`);
    await setTheme(page, 'light');
    await page.waitForTimeout(600);
    await shot(page, dir, '07-favorites.png');

    await page.goto(`${BASE}/checkout`);
    await setTheme(page, 'light');
    await page.waitForTimeout(800);
    await shot(page, dir, '06-checkout-page.png');

    await page.goto(`${BASE}/`);
    await setTheme(page, 'light');
    const cart = page.locator('a.cart, [aria-label*="cart" i], [aria-label*="Cart"]').first();
    if (await cart.count()) {
      await cart.click();
      await page.waitForTimeout(600);
      await shot(page, dir, '08-cart-modal.png');
    }
  });

  test('desktop — about and contacts', async ({ page }) => {
    const dir = outDir('desktop');
    await page.goto(`${BASE}/about`);
    await setTheme(page, 'light');
    await page.waitForTimeout(600);
    await shot(page, dir, '09-about.png');

    await page.goto(`${BASE}/contacts`);
    await setTheme(page, 'light');
    await page.waitForTimeout(600);
    await shot(page, dir, '10-contacts.png');
  });

  test('mobile — key pages', async ({ page }) => {
    const dir = outDir('mobile');
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE}/`);
    await setTheme(page, 'light');
    await shot(page, dir, 'mobile-01-homepage.png');

    await page.goto(`${BASE}/shop`);
    await page.waitForTimeout(1000);
    await shot(page, dir, 'mobile-02-shop.png');

    await page.goto(`${BASE}/checkout`);
    await page.waitForTimeout(600);
    await shot(page, dir, 'mobile-03-checkout.png');
  });

  test('admin — login and optional signed-in shots', async ({ page }) => {
    const dir = outDir('admin');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE}/admin/login`);
    await page.waitForTimeout(500);
    await shot(page, dir, 'admin-01-login.png');

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return;
    }

    await page.locator('input[type="email"]').fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').fill(ADMIN_PASSWORD);
    await page.locator('form.login-form button[type="submit"]').click();
    await page.waitForURL(/\/admin\//, { timeout: 20_000 }).catch(() => undefined);
    await page.waitForTimeout(1200);

    if (!page.url().includes('/admin/') || page.url().includes('/login')) {
      return;
    }

    await shot(page, dir, 'admin-02-dashboard.png');

    await page.goto(`${BASE}/admin/products`);
    await page.waitForTimeout(1000);
    await shot(page, dir, 'admin-03-products.png');

    await page.goto(`${BASE}/admin/sections`);
    await page.waitForTimeout(1200);
    await shot(page, dir, 'admin-04-sections.png');
  });
});
