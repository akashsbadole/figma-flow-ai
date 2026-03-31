import { test, expect } from '@playwright/test';

const PROJECT_ID = 'pmzpaprarbtaexixdfkr';

test.beforeEach(async ({ page }) => {
  // Set fake auth in localStorage
  await page.addInitScript(({ projectId }) => {
    const fakeSession = {
      access_token: 'fake-token',
      refresh_token: 'fake-refresh',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: '123',
        email: 'user@aidesignstudio.com',
      }
    };
    window.localStorage.setItem(`sb-${projectId}-auth-token`, JSON.stringify(fakeSession));
  }, { projectId: PROJECT_ID });

  // Mock Supabase REST calls
  await page.route('**/rest/v1/user_subscriptions*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([{ generations_used: 0, generations_limit: 5, plan: 'free' }]),
    });
  });
});

test('basic navigation to generator and check layout', async ({ page }) => {
  await page.goto('/generator');
  await page.waitForLoadState('networkidle');

  // Check if we are on the generator page
  await expect(page).toHaveURL(/.*generator/);

  // Check for the prompt input by placeholder
  const textarea = page.getByPlaceholder(/Describe your design/i);
  await expect(textarea).toBeVisible();

  // Test typing into the prompt
  await textarea.fill('A modern login page for a travel app');
  await expect(textarea).toHaveValue('A modern login page for a travel app');

  // Check for device selector
  await expect(page.getByRole('button', { name: 'App', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tablet', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Web', exact: true })).toBeVisible();
});
