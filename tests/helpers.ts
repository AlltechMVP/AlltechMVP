import { Page, expect } from '@playwright/test';

export async function gotoAndWait(page: Page, path = '/') {
  await page.goto(path);
  await expect(page.locator('header')).toBeVisible();
}

export async function devLoginAs(page: Page, role: string) {
  const btn = page.getByRole('button', { name: new RegExp(role, 'i') });
  await btn.click();
  await expect(page.getByText(new RegExp(`${role}\\s*·`, 'i'))).toBeVisible();
}
