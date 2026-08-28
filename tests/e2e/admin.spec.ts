import { test, expect } from '@playwright/test';

test.describe('Admin Moderation Portal E2E', () => {
  test('admin dashboard redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/login/);
  });

  test('admin reports page redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/admin/reports');
    await expect(page).toHaveURL(/login/);
  });

  test('admin users page redirects unauthenticated visitors to login', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/login/);
  });
});
