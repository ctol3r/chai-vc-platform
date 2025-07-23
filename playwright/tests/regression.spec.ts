import { test, expect } from '@playwright/test';

test('placeholder regression test', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});
