import { test, expect } from '@playwright/test';
import { gotoAndWait, devLoginAs } from './helpers';

test('Knowledge Base routes and assistant hotkey', async ({ page }) => {
  await gotoAndWait(page, '/');
  await devLoginAs(page, 'recruiter');

  await page.goto('/kb');
  await expect(page.getByText(/Knowledge Base/i)).toBeVisible();

  await page.keyboard.down('Shift');
  await page.keyboard.press('/');
  await page.keyboard.up('Shift');
  await expect(page.getByText(/Assistant/i)).toBeVisible();
});
