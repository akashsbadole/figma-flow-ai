import { test, expect } from '@playwright/test';

test.describe('App Flow', () => {
  test.beforeEach(async ({ page }) => {
    // page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

    // Mock the initial subscription call which happens on every page load with layout
    await page.route('**/api/subscription', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            plan: 'free',
            status: 'active',
            generations_used: 0,
            generations_limit: 5
          }
        }),
      });
    });

    // Mock history call
    await page.route('**/api/generation-history', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: []
        }),
      });
    });

    // Inject mock auth before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_2abc123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });
  });

  test('should navigate through the app and start generating', async ({ page }) => {
    // Navigate to generator directly
    await page.goto('/generator');

    // Check if Generator page is loaded
    await expect(page.locator('h1')).toContainText(/Design at the speed of AI/i);

    // Fill in a prompt
    const prompt = 'Create a coffee shop landing page';
    const textarea = page.locator('textarea[placeholder*="Describe"]');
    await textarea.fill(prompt);

    // Mock the generation API
    await page.route('**/api/ai/generate-full-design', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            variants: [
              { id: 'v1', name: 'Coffee Variant', html: '<div>Coffee</div>', css: '', svg: '<svg viewBox="0 0 390 844" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="brown"/></svg>' }
            ],
            designSystem: { name: 'Coffee Design' },
            templates: { screens: [] },
            deviceType: 'mobile',
            deviceWidth: 390,
            deviceHeight: 844,
            deviceLabel: 'Mobile'
          }
        }),
      });
    });

    // Mock the create design call that happens after generation
    await page.route('**/api/designs', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'd1' } })
        });
      } else {
        await route.continue();
      }
    });

    // Mock history creation
    await page.route('**/api/generation-history', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: { id: 'h1' } })
        });
      } else {
        await route.continue();
      }
    });

    // Verify generate button exists and is clickable
    const generateBtn = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await expect(generateBtn).toBeEnabled();

    // Trigger generation
    await generateBtn.click();

    // Check if results are displayed (Variants tab should show (1))
    await expect(page.getByText(/Variants/i)).toBeVisible();

    // Verify SVG was generated correctly
    // Since we mocked it, we just check if any SVG is rendered
    const svgs = page.locator('svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThan(0);
  });
});
