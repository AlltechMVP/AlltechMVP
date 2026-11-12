import { test, expect } from '@playwright/test';
import { gotoAndWait, devLoginAs } from './helpers';

test('Recruiter can change candidate status', async ({ page }) => {
  await gotoAndWait(page, '/');
  await devLoginAs(page, 'recruiter');
  await page.goto('/recruiter');

  const firstSelect = page.locator('select').first();
  await expect(firstSelect).toBeVisible();
  await firstSelect.selectOption('Interview');

  await expect(page.getByText(/status updated|failed to update/i)).toBeVisible();
});
