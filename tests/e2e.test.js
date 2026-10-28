import { test, expect } from '@playwright/test';

test.describe('Stegus arrival hub — phone size', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('page loads and shows app header', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Stegus');
    await expect(page.locator('#city')).toBeVisible();
    await expect(page.locator('#lang')).toBeVisible();
    await expect(page.locator('#eu-status')).toBeVisible();
    await expect(page.locator('#arrival-date')).toBeVisible();
  });

  test('city picker shows all four cities', async ({ page }) => {
    const city = page.locator('#city');
    await expect(city).toContainText('Trier');
    await expect(city).toContainText('Berlin');
    await expect(city).toContainText('Munich');
    await expect(city).toContainText('Hamburg');
  });

  test('language change to Arabic sets RTL', async ({ page }) => {
    await page.selectOption('#lang', 'ar');
    await page.dispatchEvent('#lang', 'change');
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  });

  test('language change back to German sets LTR', async ({ page }) => {
    await page.selectOption('#lang', 'ar');
    await page.dispatchEvent('#lang', 'change');
    await page.waitForTimeout(500);
    await page.selectOption('#lang', 'de');
    await page.dispatchEvent('#lang', 'change');
    await page.waitForTimeout(500);
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  });

  test('footer has legal page links', async ({ page }) => {
    await expect(page.locator('a[href="./privacy-policy.html"]')).toBeVisible();
    await expect(page.locator('a[href="./impressum.html"]')).toBeVisible();
  });

  test('export deadlines button exists', async ({ page }) => {
    await expect(page.locator('#ics-export')).toBeVisible();
    await expect(page.locator('#ics-export')).toContainText('Export deadlines');
  });

  test('report error button exists', async ({ page }) => {
    await expect(page.locator('#report-error')).toBeVisible();
    await expect(page.locator('#report-error')).toContainText('Report an error');
  });

  test('geo button exists', async ({ page }) => {
    await expect(page.locator('#geo-btn')).toBeVisible();
    await expect(page.locator('#geo-btn')).toContainText('Use my location');
  });

  test('coming soon note is shown', async ({ page }) => {
    await expect(page.locator('.coming-soon')).toBeVisible();
    await expect(page.locator('.coming-soon')).toContainText('coming soon');
  });

  test('disclaimer is shown', async ({ page }) => {
    await expect(page.locator('.disclaimer').first()).toBeVisible();
  });
});
