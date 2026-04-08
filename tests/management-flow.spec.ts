import { test, expect } from '@playwright/test';

test.describe('Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/projects', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
      } else {
        await route.continue();
      }
    });

    await page.route('**/api/designs', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.route('**/api/subscription', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'pro', status: 'active', generations_used: 0, generations_limit: 10 } }) });
    });

    await page.route('**/api/generation-history', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });
  });

  test('should create a new project from dashboard via generator', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Welcome back', { exact: false })).toBeVisible({ timeout: 15000 });

    const tryGeneratorBtn = page.getByRole('button', { name: 'Try AI Generator' });
    if (await tryGeneratorBtn.isVisible()) {
        await tryGeneratorBtn.click();
    } else {
        await page.getByRole('button', { name: 'New Project' }).click();
    }

    await page.waitForURL('**/generator');
    await expect(page.getByPlaceholder(/Describe your design/i)).toBeVisible();
  });

  test('should list and allow deleting designs in My Designs', async ({ page }) => {
    const mockDesign = {
      id: 'd_1',
      prompt: 'Test Design Prompt',
      html_code: '<div>Test</div>',
      css_code: '',
      created_at: new Date().toISOString()
    };

    await page.route('**/api/designs', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [mockDesign] }) });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
      }
    });

    await page.goto('/my-designs');
    await expect(page.getByText('Test Design Prompt')).toBeVisible({ timeout: 15000 });

    await page.locator('button').filter({ has: page.locator('svg.lucide-list') }).click();

    await page.route('**/api/designs', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
      } else {
        await route.continue();
      }
    });

    const trashButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash2') }).first();
    await trashButton.click({ force: true });

    await expect(page.getByText('Test Design Prompt')).not.toBeVisible({ timeout: 10000 });
  });
});
