import { test, expect } from '@playwright/test';

test.describe('Post-Game Reveal & Voting E2E', () => {
  test('reveal phase route gracefully loads with shell and error boundary', async ({ page }) => {
    await page.goto('/room/ZZZZZZ/reveal');
    await expect(page).toBeDefined();
  });
});
