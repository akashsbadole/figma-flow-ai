import { test, expect } from '@playwright/test';

test.describe('Project Selection in Generator', () => {
  test('selecting a project and generating a design includes project_id in createDesign call', async ({ page }) => {
    // Set test mode and user
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });

    const mockProject = { id: 'proj_123', name: 'Test Project' };
    let interceptedCreateDesign: any = null;

    await page.route('**/api/projects', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [mockProject] }) });
    });

    await page.route('**/api/ai/generate-full-design', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            variants: [{ id: 'v1', name: 'Variant 1', html: '<div>Design</div>', css: '', svg: '<svg></svg>' }],
            deviceInfo: { width: 390, height: 844, label: 'Mobile' },
            designSystem: {},
            templates: { screens: [] }
          }
        })
      });
    });

    await page.route('**/api/designs', async (route) => {
      if (route.request().method() === 'POST') {
        interceptedCreateDesign = route.request().postDataJSON();
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });

    // Mock other required APIs
    await page.route('**/api/subscription', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'free', generations_used: 0, generations_limit: 5 } }) });
    });
    await page.route('**/api/generation-history', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });

    await page.goto('/generator');

    // Select project
    const projectSelect = page.getByRole('combobox');
    await projectSelect.click();
    await page.getByRole('option', { name: 'Test Project' }).click();

    // Type prompt and generate
    await page.fill('textarea', 'Test project selection');
    await page.getByLabel('Generate design').click();

    // Wait for the createDesign call
    await page.waitForResponse(resp => resp.url().includes('/api/designs') && resp.request().method() === 'POST');

    // Verify
    expect(interceptedCreateDesign).not.toBeNull();
    expect(interceptedCreateDesign.project_id).toBe('proj_123');
  });
});
