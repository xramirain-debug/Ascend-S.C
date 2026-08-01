import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getOrderable, formatPrice } from "@/data/catalog";
import { getStripeForWebhooks } from "@/lib/stripe";
import { createIntakeToken } from "@/lib/intake-token";
import { ownerEmail, sendEmail } from "@/lib/email";
import { getStore } from "@/lib/store";
import { site } from "@/data/site";

/**
 * Stripe webhook — the authoritative record that a payment happened. The
 * success page is a courtesy; even if the customer closes the tab the moment
 * they pay, this handler still emails the owner the order and the customer
 * their intake link.
 */

function formatAddress(
  addr: Stripe.Address | null | undefined,
  name?: string | null,
): string {
  if (!addr) return "—";
  const parts = [
    name || undefined,
    addr.line1 || undefined,
    addr.line2 || undefined,
    [addr.city, addr.state, addr.postal_code].filter(Boolean).join(", ") || undefined,
  ].filter(Boolean);
  return parts.join("\n") || "—";
}

function itemLines(ids: string[]): string {
  return ids
    .map((id) => {
      const item = getOrderable(id);
      return item ? `- ${item.name} — ${formatPrice(item.price)}` : `- ${id}`;
    })
    .join("\n");
}

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 503 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = await getStripeForWebhooks().webhooks.constructEventAsync(
      body,
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  /* idempotency: process each checkout session once */
  const store = getStore();
  if (await store.wasProcessed(session.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  await store.markProcessed(session.id);

  const ids = (session.metadata?.items ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const email =
    session.customer_details?.email || session.customer_email || "";
  const phone = session.customer_details?.phone || "";
  const shipping =
    (session as Stripe.Checkout.Session & {
      shipping_details?: { address?: Stripe.Address; name?: string | null };
    }).shipping_details ?? null;
  const facility = shipping?.name || session.customer_details?.name || "";
  const total =
    typeof session.amount_total === "number"
      ? formatPrice(Math.round(session.amount_total / 100))
      : "—";

  const token = createIntakeToken({
    sid: session.id,
    items: ids,
    email,
    facility: facility || undefined,
  });
  const intakeUrl = token
    ? `${site.url}/intake?token=${encodeURIComponent(token)}`
    : `${site.url}/intake`;

  await store.saveOrder({
    sessionId: session.id,
    items: ids,
    amountTotal: session.amount_total,
    customerEmail: email,
    customerName: facility || undefined,
    shippingAddress: formatAddress(shipping?.address, shipping?.name),
    createdAt: new Date().toISOString(),
  });

  /* owner: order summary + intake status */
  await sendEmail({
    to: ownerEmail(),
    subject: `New paid order — ${total} — Ascend website`,
    text: [
      "A binder order was paid through the website.",
      "",
      "ITEMS",
      itemLines(ids),
      "",
      `Total paid: ${total}`,
      "",
      "CUSTOMER",
      `Email: ${email || "—"}`,
      `Phone: ${phone || "—"}`,
      "",
      "SHIPPING ADDRESS",
      formatAddress(shipping?.address, shipping?.name),
      "",
      `Facility intake: not started`,
      `Intake link (sent to the customer): ${intakeUrl}`,
      "",
      `Stripe session: ${session.id}`,
      `Received: ${new Date().toISOString()}`,
    ].join("\n"),
  });

  /* customer: confirmation + intake handoff */
  if (email) {
    await sendEmail({
      to: email,
      subject: "Your Ascend binder order — next step: facility intake",
      text: [
        "Thank you — your order is confirmed.",
        "",
        "YOUR ORDER",
        itemLines(ids),
        "",
        `Total paid: ${total}`,
        "",
        "NEXT STEP — FACILITY INTAKE",
        "Your binders are populated to your facility, so the next step is a",
        "short intake about your building, your license, and your people.",
        "It takes about 15–25 minutes, you can save and return anytime, and",
        "we'll schedule your working session once it's received.",
        "",
        `Complete your Facility Intake: ${intakeUrl}`,
        "",
        "Please don't include resident names or any resident health",
        "information in the intake — counts only.",
        "",
        `Questions? Call ${site.phone}.`,
        "— Ascend Senior Consulting",
      ].join("\n"),
    });
  }

  return NextResponse.json({ received: true });
}
