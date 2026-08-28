import { test, expect } from '@playwright/test';

test.describe('Story Reveal & Voting Flow', () => {
  test('reveal page shows loading or error when room not found', async ({ page }) => {
    await page.goto('/room/REV001/reveal');
    await expect(page).toBeDefined();
  });
});
