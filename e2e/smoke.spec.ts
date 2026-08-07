import { test, expect } from '@playwright/test';

test.describe('Storefront smoke', () => {
    test('loads home page with storefront chrome', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        await expect(page).toHaveTitle(/3D Store/i);
        await expect(page.getByRole('link', { name: /Shop/i }).first()).toBeVisible({ timeout: 20_000 });
        await expect(page.locator('main#main-content')).toBeVisible();
    });

    test('navigates to shop', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('domcontentloaded');

        const shopLink = page.getByRole('link', { name: /Shop/i }).first();
        await expect(shopLink).toBeVisible({ timeout: 20_000 });
        await shopLink.click();

        await expect(page).toHaveURL(/\/shop/);
        await expect(page.locator('#shop.shop')).toBeVisible({ timeout: 15_000 });
    });
});

test.describe('Admin smoke', () => {
    test('admin login page renders email and password fields', async ({ page }) => {
        await page.goto('/admin/login');

        await expect(page.locator('form.login-form')).toBeVisible({ timeout: 15_000 });
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
    });
});
