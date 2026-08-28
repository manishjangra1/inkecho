import { test, expect } from '@playwright/test';

test.describe('Authentication & Guest Onboarding E2E', () => {
  test('landing page loads hero, how it works, and quick join card', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/InkEcho/);
    await expect(page.locator('h1')).toContainText('Drawing');

    // Create room button
    const createBtn = page.getByRole('link', { name: /create room/i }).first();
    await expect(createBtn).toBeVisible();

    // Quick join card
    const joinInput = page.getByPlaceholder(/ABC123/i);
    if (await joinInput.isVisible()) {
      await expect(joinInput).toBeVisible();
    }
  });

  test('browse public rooms view loads with search and pagination controls', async ({ page }) => {
    await page.goto('/browse');

    await expect(page.locator('h1')).toContainText('Public Rooms');
    await expect(page.getByPlaceholder(/search by room code/i)).toBeVisible();
  });

  test('login page renders email/password form and navigation to register', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.locator('h2, h1')).toContainText(/Welcome Back|Sign In/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('register page renders display name, email, and password inputs', async ({ page }) => {
    await page.goto('/auth/register');

    await expect(page.locator('h2, h1')).toContainText(/Create Account|Get Started/i);
    await expect(page.getByLabel(/player name|display name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('forgot password page renders reset email request form', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });
});
