import { test, expect } from '@playwright/test';

test.describe('Home Page Smoke Test', () => {
    test('should load the home page and show the 3D viewer', async ({ page }) => {
        // Go to the home page
        await page.goto('/');

        // Check the title
        await expect(page).toHaveTitle(/Angular 3D Store/);

        // Verify the 3D viewer is rendered (standalone component selector)
        const threeDViewer = page.locator('app-three-d-viewer');
        await expect(threeDViewer).toBeVisible();

        // Verify header sections
        await expect(page.locator('app-header')).toBeVisible();
    });

    test('should navigate to the shop page', async ({ page }) => {
        await page.goto('/');

        // Find and click the Shop link in the header or hero
        // Assuming there's a link with text "Shop"
        const shopLink = page.getByRole('link', { name: /Shop/i }).first();
        await shopLink.click();

        // Verify URL change
        await expect(page).toHaveURL(/\/shop/);
    });
});
