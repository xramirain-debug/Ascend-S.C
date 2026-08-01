import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { stripeConfigured } from "@/lib/stripe";
import CartView from "./CartView";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your binder selection, then check out or send an order request.",
  robots: { index: false },
};

/* Read Stripe configuration at request time so adding keys to the host
   doesn't require a code change — just a restart. */
export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <>
      <PageHero
        eyebrow="Binder Shop"
        title="Your Cart"
        lede="One of each — every set is populated to a single facility. Pay by card, or send an order request if a check works better for your building."
      />
      <div
        className="section"
        style={{ maxWidth: 860, margin: "0 auto", width: "100%" }}
      >
        <CartView checkoutEnabled={stripeConfigured()} />
      </div>
    </>
  );
}
