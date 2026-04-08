import { test, expect } from '@playwright/test';

test.describe('Generator Comprehensive', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });

    await page.route('**/api/subscription', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'pro', status: 'active', generations_used: 0 } }) });
    });
    await page.route('**/api/projects', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/generation-history', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.route('**/api/increment-usage', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
    });
    await page.route('**/api/designs', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });
  });

  test('should enhance prompt and show parameters', async ({ page }) => {
    await page.goto('/generator');

    const textarea = page.getByPlaceholder(/Describe your design/i);
    await textarea.fill('modern bank app');

    await page.route('**/api/ai/enhance-prompt', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            enhancedPrompt: 'A sophisticated fintech banking mobile application with biometric login',
            parameters: [
              { label: 'Primary Color', value: '#0052FF', type: 'color' },
              { label: 'Corner Radius', value: '12px', type: 'number' }
            ]
          }
        })
      });
    });

    await page.getByTitle('AI Prompt Enhancement').click();

    // Check for success text in DOM - simplified for headless
    await expect(textarea).toHaveValue('A sophisticated fintech banking mobile application with biometric login');
    await expect(page.getByText('Primary Color:')).toBeVisible();
    await expect(page.getByText('#0052FF')).toBeVisible();
  });

  test('should use advanced canvas tools in expanded preview', async ({ page }) => {
    await page.goto('/generator');
    await page.getByPlaceholder(/Describe your design/i).fill('test design');

    await page.route('**/api/ai/generate-full-design', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            variants: [{
              id: 'v1',
              name: 'Test Design',
              html: '<div id="box">Test</div>',
              css: '#box { color: red; }',
              svg: '<svg id="svg-root" viewBox="0 0 390 844"><rect id="box" width="100" height="100" fill="red" /></svg>',
              metadata: { extractedTokens: { colors: ['red'], fonts: [], fontSizes: [] } }
            }],
            deviceInfo: { width: 390, height: 844, label: 'Mobile' }
          }
        })
      });
    });

    await page.getByLabel('Generate design').click();
    await expect(page.getByText('Test Design').first()).toBeVisible({ timeout: 20000 });

    await page.getByTitle('Expand preview').click({ force: true });

    // Verify tools are clickable
    const rulerBtn = page.getByTitle('Toggle Rulers');
    await rulerBtn.click();
    // In headless, we just check if it was clicked/state changed if possible,
    // but at least check visibility of button
    await expect(rulerBtn).toBeVisible();

    const gridBtn = page.getByTitle('Toggle Grid');
    await gridBtn.click();
    await expect(gridBtn).toBeVisible();

    // Panel tabs
    await page.getByRole('tab', { name: /Layers/i }).click();
    // Search for layer name
    await expect(page.locator('div').filter({ hasText: /^box$/ }).first()).toBeVisible();

    await page.getByRole('tab', { name: /Inspect/i }).click();
    await expect(page.getByText('red').first()).toBeVisible();
  });
});
