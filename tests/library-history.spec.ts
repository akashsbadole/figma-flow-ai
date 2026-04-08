import { test, expect } from '@playwright/test';

test.describe('Library and History', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com'
      }));
    });

    await page.route('**/api/subscription', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'pro' } }) });
    });
    await page.route('**/api/admin/users', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, profiles: [], roles: [] }) });
    });
  });

  test('should browse templates and preview one', async ({ page }) => {
    const mockTemplate = {
      id: 't1',
      name: 'Modern Login',
      description: 'A clean login form',
      category: 'Forms',
      html_code: '<div>Login</div>',
      css_code: '',
      tags: ['auth', 'form']
    };

    await page.route('**/api/templates', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [mockTemplate] }) });
    });
    await page.route('**/api/saved-templates', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.goto('/templates');
    await expect(page.getByText('Modern Login').first()).toBeVisible();

    await page.getByRole('button', { name: 'Preview' }).click();
    await expect(page.getByRole('heading', { name: 'Modern Login' })).toBeVisible();
  });

  test('should view generation history', async ({ page }) => {
    const mockHistory = [
      {
        id: 'h1',
        type: 'variant',
        prompt: 'Generate a hero section',
        result: { html: '<div>Hero</div>' },
        created_at: new Date().toISOString()
      }
    ];

    await page.route('**/api/generation-history', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: mockHistory }) });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
      }
    });

    await page.goto('/history');
    await expect(page.getByText('Generate a hero section')).toBeVisible();

    await page.getByTitle('Preview').click();
    await expect(page.getByRole('heading', { name: 'Generate a hero section' })).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    // Switch to empty list for GET calls
    await page.route('**/api/generation-history', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.getByTitle('Delete').click({ force: true });

    await expect(page.getByText(/No history/i).first()).toBeVisible({ timeout: 15000 });
  });
});
