import { test, expect } from '@playwright/test';

test.describe('Authentication & Guest Onboarding', () => {
  test('landing page loads and allows creating a guest room', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/InkEcho/);
    await expect(page.locator('h1')).toContainText('Drawing');

    // Create room button
    const createBtn = page.getByRole('link', { name: /create room/i }).first();
    await expect(createBtn).toBeVisible();
  });

  test('browse public rooms view loads', async ({ page }) => {
    await page.goto('/browse');

    await expect(page.locator('h1')).toContainText('Public Rooms');
    await expect(page.getByPlaceholder(/search by room code/i)).toBeVisible();
  });
});
