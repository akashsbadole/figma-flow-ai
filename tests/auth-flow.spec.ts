import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page and show Clerk sign-in', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('.cl-signIn-root')).toBeVisible();
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });

  test('should navigate to sign-up page and show Clerk sign-up', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('.cl-signUp-root')).toBeVisible();
  });

  test('should handle forgot password flow with mocks', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    const emailInput = page.getByPlaceholder('name@example.com');
    await emailInput.fill('test@example.com');

    await page.route('**/api/auth/request-password-reset', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Reset link sent' })
      });
    });

    await page.getByRole('button', { name: 'Send Reset Link' }).click();

    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  });

  test('should redirect to dashboard if already logged in', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com'
      }));
    });

    await page.goto('/auth');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
