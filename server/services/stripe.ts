export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    generationsLimit: 5,
    features: [
      '5 design generations per month',
      'Basic templates',
      'Community support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    generationsLimit: 100,
    features: [
      '100 design generations per month',
      'All templates',
      'Priority support',
      'Export to Figma',
      'Design system builder',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 79,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    generationsLimit: -1,
    features: [
      'Unlimited generations',
      'All templates',
      'Dedicated support',
      'Export to Figma',
      'Design system builder',
      'API access',
      'Team collaboration',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

export interface SubscriptionData {
  userId: string;
  planId: PlanId;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export async function createStripeCustomer(email: string, userId: string): Promise<string> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email,
      metadata: JSON.stringify({ userId }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }

  const customer = await response.json();
  return customer.id;
}

export async function createSubscription(customerId: string, priceId: string): Promise<{
  subscriptionId: string;
  clientSecret: string;
}> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch('https://api.stripe.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId,
      'items[0][price]': priceId,
      'payment_behavior': 'default_incomplete',
      'payment_settings[save_default_payment_method]': 'on_subscription',
      expand: 'data.latest_invoice.payment_intent',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }

  const subscription = await response.json();
  const invoice = subscription.latest_invoice;
  const paymentIntent = invoice.payment_intent;

  return {
    subscriptionId: subscription.id,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      cancel_at_period_end: 'true',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }
}

export async function reactivateSubscription(subscriptionId: string): Promise<void> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      cancel_at_period_end: 'false',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }
}

export async function getSubscription(subscriptionId: string): Promise<{
  status: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }

  const subscription = await response.json();
  
  return {
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: customerId,
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Stripe error: ${error}`);
  }

  const session = await response.json();
  return session.url;
}

export function constructWebhookEvent(payload: string, signature: string, endpointSecret: string) {
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key not configured');
  }

  const crypto = require('crypto');
  const timestamp = payload.slice(0, payload.indexOf('{"'));
  const computedSignature = crypto
    .createHmac('sha256', endpointSecret)
    .update(`${timestamp}${payload.slice(payload.indexOf('{'))}`)
    .digest('hex');
  
  if (computedSignature !== signature) {
    throw new Error('Invalid webhook signature');
  }

  return JSON.parse(payload.slice(payload.indexOf('{')));
}

export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
};
