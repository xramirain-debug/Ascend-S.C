"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  bundles,
  findBundleDuplicates,
  formatPrice,
  getOrderable,
  productsInSection,
  sectionMeta,
  type ProductSection,
} from "@/data/catalog";
import { useCart } from "@/components/CartProvider";

const sectionOrder: ProductSection[] = [
  "governance",
  "operations",
  "people",
  "addons",
];

export default function CartView({
  checkoutEnabled,
}: {
  checkoutEnabled: boolean;
}) {
  const { ids, add, remove } = useCart();
  const [showPicker, setShowPicker] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const items = useMemo(
    () =>
      ids
        .map((id) => getOrderable(id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [ids],
  );
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);
  const duplicates = useMemo(() => findBundleDuplicates(ids), [ids]);

  async function startCheckout() {
    setCheckingOut(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: ids }),
      });
      const body = await res.json().catch(() => null);
      if (res.ok && body?.url) {
        window.location.href = body.url;
        return;
      }
      setCheckoutError(
        (body && typeof body.error === "string" && body.error) ||
          "We couldn't start checkout. Please try again, or send an order request below.",
      );
    } catch {
      setCheckoutError(
        "We couldn't reach the server. Please check your connection and try again.",
      );
    }
    setCheckingOut(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {items.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
          <h2 style={{ marginBottom: 10 }}>Your cart is empty</h2>
          <p style={{ marginBottom: 20 }}>
            Every binder is built to your facility — start with the library.
          </p>
          <Link href="/shop" className="btn btn--primary">
            Browse the Binder Library
          </Link>
        </div>
      ) : (
        <>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {items.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 22px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Link
                      href={`/shop/${item.id}`}
                      style={{ fontWeight: 600, color: "var(--navy)", fontSize: 15.5 }}
                    >
                      {item.name}
                    </Link>
                    <span style={{ fontSize: 13, color: "var(--body)" }}>
                      One set, populated to your facility
                    </span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 16, flex: "none" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                      {formatPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      className="text-link"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => remove(item.id)}
                      aria-label={`Remove ${item.name} from your cart`}
                    >
                      Remove
                    </button>
                  </span>
                </li>
              ))}
              <li
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "16px 22px",
                  background: "var(--paper)",
                  fontWeight: 700,
                  color: "var(--navy)",
                  fontSize: 17,
                }}
              >
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </li>
            </ul>
          </div>

          {duplicates.length > 0 ? (
            <div className="notice notice--privacy" role="alert">
              <strong>Heads up:</strong> your cart holds a bundle that already
              includes{" "}
              {duplicates
                .map((id) => getOrderable(id)?.name)
                .filter(Boolean)
                .join(", ")}
              {" "}— you&apos;d be paying for{" "}
              {duplicates.length === 1 ? "it" : "them"} twice.{" "}
              <button
                type="button"
                className="text-link"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => duplicates.forEach((id) => remove(id))}
              >
                Remove the duplicate{duplicates.length === 1 ? "" : "s"}
              </button>
            </div>
          ) : null}

          {checkoutError ? (
            <div className="notice notice--error" role="alert">
              {checkoutError}
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {checkoutEnabled ? (
              <button
                type="button"
                className="btn btn--primary"
                onClick={startCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? "Opening checkout…" : "Checkout"}
              </button>
            ) : null}
            <Link
              href="/order"
              className={checkoutEnabled ? "btn btn--secondary" : "btn btn--primary"}
            >
              Request an order instead
            </Link>
          </div>
          <p style={{ fontSize: 13.5 }}>
            {checkoutEnabled
              ? "Card payments are handled on a secure checkout page. Many facilities pay by check instead — the order request works just as well, and either way your facility intake comes next."
              : "Send the order request and we'll reach out within one business day to begin your facility intake."}
          </p>
        </>
      )}

      <div>
        <button
          type="button"
          className="btn btn--quiet"
          aria-expanded={showPicker}
          onClick={() => setShowPicker((v) => !v)}
        >
          {showPicker ? "Hide the full catalog" : "Add binders from the catalog"}
        </button>
      </div>

      {showPicker ? (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {sectionOrder.map((section) => (
            <fieldset key={section} className="field">
              <legend className="field__legend" style={{ marginBottom: 8 }}>
                {sectionMeta[section].title}
              </legend>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {productsInSection(section).map((p) => (
                  <label key={p.id} className="choice-row">
                    <input
                      type="checkbox"
                      checked={ids.includes(p.id)}
                      onChange={(e) => (e.target.checked ? add(p.id) : remove(p.id))}
                    />
                    <span>
                      {p.name}{" "}
                      <span style={{ color: "var(--sage-dark)", fontWeight: 600 }}>
                        {formatPrice(p.price)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <fieldset className="field">
            <legend className="field__legend" style={{ marginBottom: 8 }}>
              Bundles
            </legend>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bundles.map((b) => (
                <label key={b.id} className="choice-row">
                  <input
                    type="checkbox"
                    checked={ids.includes(b.id)}
                    onChange={(e) => (e.target.checked ? add(b.id) : remove(b.id))}
                  />
                  <span>
                    {b.name}{" "}
                    <span style={{ color: "var(--sage-dark)", fontWeight: 600 }}>
                      {formatPrice(b.price)}
                    </span>{" "}
                    <span className="price-struck" style={{ fontSize: 13.5 }}>
                      {formatPrice(b.alaCartePrice)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      ) : null}
    </div>
  );
}
