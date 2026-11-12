import { test, expect } from '@playwright/test';
import { gotoAndWait, devLoginAs } from './helpers';

test('Client approvals list and approve action', async ({ page }) => {
  await gotoAndWait(page, '/');
  await devLoginAs(page, 'client');
  await page.goto('/client/approvals');

  const card = page.locator('.border.rounded-lg').first();
  await expect(card).toBeVisible();

  const approveBtn = card.getByRole('button', { name: /approve/i });
  await approveBtn.click();

  const toast = page.getByText(/updated status|status updated/i);
  await expect(toast).toBeVisible({ timeout: 3000 });
});
