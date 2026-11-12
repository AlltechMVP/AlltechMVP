import { test, expect } from '@playwright/test';
import { gotoAndWait } from './helpers';

test('home renders and 404 works', async ({ page }) => {
  await gotoAndWait(page, '/');
  await expect(page.getByText('Welcome')).toBeVisible();

  await page.goto('/definitely-not-a-route');
  await expect(page.getByText('Page not found')).toBeVisible();
});
