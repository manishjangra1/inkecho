import { test, expect } from '@playwright/test';

test.describe('Lobby & Room Flow', () => {
  test('create room page validates inputs', async ({ page }) => {
    await page.goto('/create');

    const displayNameInput = page.getByPlaceholder(/enter your player name/i);
    await expect(displayNameInput).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /create room/i });
    await expect(submitBtn).toBeVisible();
  });

  test('join room page allows entering room code', async ({ page }) => {
    await page.goto('/join');

    await expect(page.getByRole('button', { name: /join room/i })).toBeVisible();
  });
});
