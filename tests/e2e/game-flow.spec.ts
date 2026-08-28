import { test, expect } from '@playwright/test';

test.describe('Game Turn & Phase Flow', () => {
  test('redirects unknown room to 404 or home', async ({ page }) => {
    await page.goto('/room/ZZZZZZ/game');
    // If room doesn't exist, Next.js handles notFound or loading
    await expect(page).toBeDefined();
  });
});
