import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import OrderForm from "./OrderForm";

export const metadata: Metadata = {
  title: "Start an Order",
  description:
    "Start a binder order for your facility. Select your binders and send an order request — we'll reach out within one business day to begin your facility intake.",
};

export default function OrderPage() {
  return (
    <>
      <PageHero
        eyebrow="Binder Shop"
        title="Start an Order"
        lede="Because every set is populated to your facility, orders begin with a request — not a checkout. Confirm your selection below and tell us where to reach you."
      />
      <div className="section" style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
        <OrderForm />
      </div>
    </>
  );
}
