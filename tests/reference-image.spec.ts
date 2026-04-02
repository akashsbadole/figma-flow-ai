import { test, expect } from '@playwright/test';

test.describe('Design Generation with Reference Image', () => {
  test('sending a design request with a reference image includes it in the payload', async ({ page }) => {
    // Set test mode and user
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });

    let interceptedRequest: any = null;

    await page.route('**/api/ai/generate-full-design', async (route) => {
      interceptedRequest = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            variants: [{ id: 'v1', name: 'Variant 1', html: '<div>Ref</div>', css: '', svg: '<svg></svg>' }],
            deviceInfo: { width: 390, height: 844, label: 'Mobile' },
            designSystem: {},
            templates: { screens: [] }
          }
        })
      });
    });

    await page.route('**/api/subscription', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'free', generations_used: 0, generations_limit: 5 } }) });
    });

    await page.route('**/api/designs', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });

    await page.route('**/api/generation-history', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) });
    });

    await page.goto('/generator');

    // Type a prompt
    await page.fill('textarea', 'Test prompt with image');

    // Simulate image upload by injecting a base64 string directly into the component's state or
    // better yet, just use the input if possible.
    // Since it's a hidden input, we can use setInputFiles
    const dataTransfer = await page.evaluateHandle(() => {
        const dt = new DataTransfer();
        const file = new File([''], 'test.png', { type: 'image/png' });
        dt.items.add(file);
        return dt;
    });

    await page.setInputFiles('input[type="file"]', {
        name: 'test.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-content')
    });

    // Wait for preview to appear (means reader.onload was called)
    await expect(page.locator('img[alt="Reference"]')).toBeVisible();

    // Click generate
    await page.getByLabel('Generate design').click();

    // Wait for the request to be intercepted using waitForRequest
    const request = await page.waitForRequest('**/api/ai/generate-full-design');
    interceptedRequest = request.postDataJSON();

    // Verify intercepted request
    expect(interceptedRequest).not.toBeNull();
    expect(interceptedRequest.referenceImage).toContain('data:image/png;base64,');
    expect(interceptedRequest.prompt).toBe('Test prompt with image');
  });
});
