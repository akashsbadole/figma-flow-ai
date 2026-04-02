import { test, expect } from '@playwright/test';

test.describe('Pricing Upgrade Flow', () => {
  test('clicking Upgrade to Pro calls the create-customer and create-checkout-session APIs', async ({ page }) => {
    // Set test mode and user
    await page.addInitScript(() => {
      window.localStorage.setItem('test_mode', 'true');
      window.localStorage.setItem('clerk_user', JSON.stringify({
        id: 'user_123',
        email: 'test@example.com',
        display_name: 'Test User'
      }));
    });

    // Intercept API calls
    let customerCalled = false;
    let checkoutSessionCalled = false;

    await page.route('**/api/payment/create-customer', async (route) => {
      customerCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { customerId: 'cus_123' } }) });
    });

    await page.route('**/api/payment/create-checkout-session', async (route) => {
      checkoutSessionCalled = true;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { sessionUrl: 'https://checkout.stripe.com/test' } }) });
    });

    await page.route('**/api/subscription', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { plan: 'free', generations_used: 0, generations_limit: 5 } }) });
    });

    await page.goto('/pricing');

    // Find and click "Upgrade to Pro"
    const upgradeButton = page.getByRole('button', { name: /Upgrade to Pro/i });
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();

    // Wait for the calls to happen as they are async
    await page.waitForTimeout(2000);

    // Verify API calls
    expect(customerCalled).toBe(true);
    expect(checkoutSessionCalled).toBe(true);
  });
});
