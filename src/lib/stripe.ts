import Stripe from "stripe";

/**
 * Lazy Stripe client. Returns null when STRIPE_SECRET_KEY is not configured —
 * callers must degrade gracefully (the shop falls back to the order-request
 * flow and the site never breaks undeployed).
 */

let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/**
 * Webhook signature verification needs a Stripe instance but no live API key,
 * so a placeholder key keeps verification working even in odd deployments
 * where only the webhook secret is set.
 */
export function getStripeForWebhooks(): Stripe {
  return getStripe() ?? new Stripe("sk_test_placeholder");
}

/** Stripe tax code for tangible goods — printed, shipped binders. */
export const PHYSICAL_GOODS_TAX_CODE = "txcd_99999999";

export function stripeTaxEnabled(): boolean {
  return process.env.ENABLE_STRIPE_TAX === "true";
}
