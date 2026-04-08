import { test, expect } from '@playwright/test';

test.describe('Admin and Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'admin_123',
        email: 'admin@example.com'
      }));
    });

    // Mock admin data
    await page.route('**/api/admin/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            profiles: [{ user_id: 'u1', display_name: 'User One', is_enabled: true, created_at: new Date().toISOString() }],
            subscriptions: [{ user_id: 'u1', plan: 'free', generations_used: 1, generations_limit: 5 }],
            roles: [{ user_id: 'admin_123', role: 'admin' }]
          }
        })
      });
    });

    await page.route('**/api/subscription', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'pro' } }) });
    });
  });

  test('should access admin panel and see user list', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
    await expect(page.getByText('User One')).toBeVisible();
  });

  test('should trigger export downloads in expanded preview', async ({ page }) => {
    // Mock generation
    await page.route('**/api/ai/generate-full-design', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            variants: [{ id: 'v1', name: 'Export Variant', html: '<div>Export</div>', css: '', svg: '<svg></svg>' }],
            deviceInfo: { width: 1440, height: 900, label: 'Desktop' }
          }
        })
      });
    });

    await page.goto('/generator');
    await page.fill('textarea', 'export test');
    await page.click('button[aria-label="Generate design"]');
    await expect(page.getByText('Export Variant').first()).toBeVisible({ timeout: 15000 });

    await page.getByTitle('Expand preview').click({ force: true });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'HTML', exact: true }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.html');

    const downloadCssPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'CSS', exact: true }).click();
    const downloadCss = await downloadCssPromise;
    expect(downloadCss.suggestedFilename()).toContain('.css');
  });
});
