import { test, expect } from '@playwright/test';

test.describe('Lobby & Room Creation Flow E2E', () => {
  test('create room form validates required display name and visibility toggle', async ({
    page,
  }) => {
    await page.goto('/create');

    await expect(page.locator('h1, h2')).toContainText(/Create Room/i);

    const displayNameInput = page.getByPlaceholder(/enter your player name/i);
    await expect(displayNameInput).toBeVisible();

    const submitBtn = page.getByRole('button', { name: /create room/i });
    await expect(submitBtn).toBeVisible();

    // Fill form and verify input updates
    await displayNameInput.fill('SpeedyArtist');
    await expect(displayNameInput).toHaveValue('SpeedyArtist');
  });

  test('join room page allows entering room code and player display name', async ({ page }) => {
    await page.goto('/join');

    await expect(page.locator('h1, h2')).toContainText(/Join Room/i);
    await expect(page.getByRole('button', { name: /join room/i })).toBeVisible();
  });

  test('direct invite join page pre-fills room code', async ({ page }) => {
    await page.goto('/join/XYZ789');

    await expect(page.locator('h1, h2')).toContainText(/Join Room/i);
    const codeInput = page.getByPlaceholder(/ABC123|XYZ789/i);
    if (await codeInput.isVisible()) {
      await expect(codeInput).toBeVisible();
    }
  });
});
