import { test, expect } from '@playwright/test';
import { gotoAndWait, devLoginAs } from './helpers';

test('CEO dashboard requires CEO/Admin', async ({ page }) => {
  await gotoAndWait(page, '/');
  await page.goto('/ceo');
  await gotoAndWait(page, '/');
  await devLoginAs(page, 'recruiter');
  await page.goto('/ceo');
  await expect(page).not.toHaveURL(/\/ceo$/);

  await gotoAndWait(page, '/');
  await devLoginAs(page, 'ceo');
  await page.goto('/ceo');
  await expect(page.getByText('CEO Dashboard')).toBeVisible();
});
