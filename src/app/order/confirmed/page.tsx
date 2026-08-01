import type { Metadata } from "next";
import Link from "next/link";
import { getOrderable, formatPrice } from "@/data/catalog";
import { getStripe } from "@/lib/stripe";
import { createIntakeToken } from "@/lib/intake-token";
import { site } from "@/data/site";
import CartClearer from "./CartClearer";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your Ascend binder order is confirmed.",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  const stripe = getStripe();

  let paid = false;
  let ids: string[] = [];
  let email = "";
  let facility = "";
  let total = "";

  if (stripe && sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        paid = true;
        ids = (session.metadata?.items ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        email = session.customer_details?.email || "";
        const shipping = (
          session as typeof session & {
            shipping_details?: { name?: string | null };
          }
        ).shipping_details;
        facility = shipping?.name || session.customer_details?.name || "";
        total =
          typeof session.amount_total === "number"
            ? formatPrice(Math.round(session.amount_total / 100))
            : "";
      }
    } catch {
      /* fall through to the pending state — never an error for a payer */
    }
  }

  if (!paid) {
    /* the webhook may land seconds after the redirect — stay calm */
    return (
      <div className="section" style={{ maxWidth: 720, margin: "0 auto", width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: 12 }}>Finishing up your order…</h1>
        <p style={{ maxWidth: "52ch", margin: "0 auto 20px" }}>
          We&apos;re confirming your payment — this sometimes takes a few
          seconds. Your confirmation email with the facility intake link is on
          its way. If it hasn&apos;t arrived in a few minutes, check your spam
          folder or call {site.phone}.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {sessionId ? (
            <a
              href={`/order/confirmed?session_id=${encodeURIComponent(sessionId)}`}
              className="btn btn--primary"
            >
              Check again
            </a>
          ) : null}
          <Link href="/" className="btn btn--secondary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const token = createIntakeToken({
    sid: sessionId!,
    items: ids,
    email,
    facility: facility || undefined,
  });
  const intakeHref = token
    ? `/intake?token=${encodeURIComponent(token)}`
    : "/intake";

  return (
    <div className="section" style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <CartClearer />
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p className="eyebrow" style={{ marginBottom: 10 }}>
          Order confirmed
        </p>
        <h1>Thank you — your binders are underway</h1>
        <p style={{ maxWidth: "54ch", margin: "12px auto 0" }}>
          One step left: the facility intake. It&apos;s how your set gets
          populated to your building, your license, and your people — about
          15–25 minutes, and you can save and return anytime.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 22, padding: 0, overflow: "hidden" }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {ids.map((id) => {
            const item = getOrderable(id);
            if (!item) return null;
            return (
              <li
                key={id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "14px 22px",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: 15 }}>
                  {item.name}
                </span>
                <span style={{ fontWeight: 700, color: "var(--navy)", flex: "none" }}>
                  {formatPrice(item.price)}
                </span>
              </li>
            );
          })}
          {total ? (
            <li
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "14px 22px",
                background: "var(--paper)",
                fontWeight: 700,
                color: "var(--navy)",
              }}
            >
              <span>Total paid</span>
              <span>{total}</span>
            </li>
          ) : null}
        </ul>
      </div>

      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <Link href={intakeHref} className="btn btn--primary">
          Start Your Facility Intake
        </Link>
        <p style={{ fontSize: 14 }}>
          We&apos;ve also emailed this link
          {email ? (
            <>
              {" "}
              to <strong>{email}</strong>
            </>
          ) : null}
          , so you can start now or when your team is ready.
        </p>
      </div>
    </div>
  );
}
