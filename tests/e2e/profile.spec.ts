import { test, expect } from '@playwright/test';

test.describe('Profile & History User Journeys E2E', () => {
  test('profile page redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/login/);
  });

  test('profile history page redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/profile/history');
    await expect(page).toHaveURL(/login/);
  });

  test('profile stats page redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/profile/stats');
    await expect(page).toHaveURL(/login/);
  });
});
