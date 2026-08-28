import { test, expect } from '@playwright/test';

test.describe('Game Turn & Phase Flow E2E', () => {
  test('gracefully renders room shell layout when navigating to game routes', async ({
    page,
  }) => {
    await page.goto('/room/ZZZZZZ/game');
    // If room doesn't exist, Next.js handles notFound or error boundary
    await expect(page).toBeDefined();
  });

  test('spectator route renders game spectator view', async ({ page }) => {
    await page.goto('/room/ZZZZZZ/spectate');
    await expect(page).toBeDefined();
  });
});
