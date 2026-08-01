import { NextRequest, NextResponse } from "next/server";
import { getOrderable, findBundleDuplicates } from "@/data/catalog";
import {
  getStripe,
  PHYSICAL_GOODS_TAX_CODE,
  stripeTaxEnabled,
} from "@/lib/stripe";
import { site } from "@/data/site";

/**
 * Creates a Stripe Checkout Session for the cart. The client sends item ids
 * only — names and amounts always come from the canonical catalog file, so a
 * tampered request can never change a price.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Card checkout isn't available right now — please use the order request instead.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const rawItems = (body as { items?: unknown })?.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (rawItems.length > 50) {
    return NextResponse.json({ error: "Too many items." }, { status: 400 });
  }

  /* validate against the catalog; de-duplicate; quantity is always 1 */
  const ids = [...new Set(rawItems.filter((x): x is string => typeof x === "string"))];
  const items = ids.map((id) => ({ id, item: getOrderable(id) }));
  const unknown = items.filter((x) => !x.item);
  if (unknown.length > 0 || items.length === 0) {
    return NextResponse.json(
      { error: "Your cart contains an item we no longer offer. Please review it and try again." },
      { status: 400 },
    );
  }

  /* the cart UI warns about bundle/component overlap; the server refuses to
     charge for it outright */
  if (findBundleDuplicates(ids).length > 0) {
    return NextResponse.json(
      {
        error:
          "Your cart holds a bundle and one of its included binders — remove the duplicate before checking out.",
      },
      { status: 400 },
    );
  }

  const withTax = stripeTaxEnabled();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: items.map(({ item }) => ({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: item!.price * 100,
          product_data: {
            name: item!.name,
            ...(withTax ? { tax_code: PHYSICAL_GOODS_TAX_CODE } : {}),
          },
        },
      })),
      ...(withTax ? { automatic_tax: { enabled: true } } : {}),
      billing_address_collection: "auto",
      shipping_address_collection: { allowed_countries: ["US"] },
      phone_number_collection: { enabled: true },
      metadata: { items: ids.join(",") },
      success_url: `${site.url}/order/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site.url}/cart`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session creation failed:", err);
    return NextResponse.json(
      {
        error:
          "We couldn't start checkout. Please try again, or send an order request instead.",
      },
      { status: 502 },
    );
  }
}
