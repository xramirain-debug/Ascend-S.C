"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  bundles,
  formatPrice,
  getOrderable,
  productsInSection,
  sectionMeta,
  type ProductSection,
} from "@/data/catalog";
import {
  addToSelection,
  clearSelection,
  getSelection,
  onSelectionChange,
  removeFromSelection,
} from "@/lib/order-store";
import { submitForm } from "@/lib/submit";

const sectionOrder: ProductSection[] = [
  "governance",
  "operations",
  "people",
  "addons",
];

interface Fields {
  facilityName: string;
  contactName: string;
  email: string;
  phone: string;
  notes: string;
}

const emptyFields: Fields = {
  facilityName: "",
  contactName: "",
  email: "",
  phone: "",
  notes: "",
};

export default function OrderForm() {
  const [selection, setSelection] = useState<string[]>([]);
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const sync = () => setSelection(getSelection());
    sync();
    return onSelectionChange(sync);
  }, []);

  const items = useMemo(
    () =>
      selection
        .map((id) => getOrderable(id))
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
    [selection],
  );

  const total = items.reduce((sum, i) => sum + i.price, 0);

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.facilityName.trim()) next.facilityName = "Please enter your facility name.";
    if (!fields.contactName.trim()) next.contactName = "Please enter a contact name.";
    if (!fields.email.trim() || !/^\S+@\S+\.\S+$/.test(fields.email))
      next.email = "Please enter a valid email address.";
    if (!fields.phone.trim()) next.phone = "Please enter a phone number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0 || !validate()) return;
    setStatus("sending");
    setServerError("");
    const result = await submitForm(
      "order",
      {
        ...fields,
        items: items.map((i) => `${i.name} — ${formatPrice(i.price)}`),
        estimatedTotal: formatPrice(total),
      },
      honeypot,
    );
    if (result.ok) {
      clearSelection();
      setStatus("done");
    } else {
      setStatus("error");
      setServerError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="card" style={{ textAlign: "center", padding: "44px 36px" }}>
        <h2 style={{ marginBottom: 10 }}>Order request received</h2>
        <p style={{ maxWidth: "48ch", margin: "0 auto 20px" }}>
          Thank you — we&apos;ll reach out within one business day to begin your
          facility intake. If it&apos;s faster, you can start the intake now.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/intake" className="btn btn--primary">
            Start the Facility Intake
          </Link>
          <Link href="/shop" className="btn btn--secondary">
            Back to the Binder Library
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* selection */}
      <section aria-labelledby="order-selection">
        <h2 id="order-selection" style={{ marginBottom: 14, fontSize: "1.4rem" }}>
          Your selection
        </h2>
        {items.length === 0 ? (
          <div className="card" style={{ background: "var(--paper)" }}>
            <p>
              Nothing selected yet. Add binders below, or{" "}
              <Link href="/shop" className="text-link">
                browse the Binder Library
              </Link>
              .
            </p>
          </div>
        ) : (
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
                    padding: "14px 22px",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: 15 }}>
                    {item.name}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 16, flex: "none" }}>
                    <span style={{ fontWeight: 700, color: "var(--navy)" }}>
                      {formatPrice(item.price)}
                    </span>
                    <button
                      type="button"
                      className="text-link"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                      onClick={() => removeFromSelection(item.id)}
                      aria-label={`Remove ${item.name} from your order`}
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
                  padding: "14px 22px",
                  background: "var(--paper)",
                  fontWeight: 700,
                  color: "var(--navy)",
                }}
              >
                <span>Estimated total</span>
                <span>{formatPrice(total)}</span>
              </li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: 14 }}>
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
          <div className="card" style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 20 }}>
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
                        checked={selection.includes(p.id)}
                        onChange={(e) =>
                          e.target.checked
                            ? addToSelection(p.id)
                            : removeFromSelection(p.id)
                        }
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
                      checked={selection.includes(b.id)}
                      onChange={(e) =>
                        e.target.checked
                          ? addToSelection(b.id)
                          : removeFromSelection(b.id)
                      }
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
      </section>

      {/* contact details */}
      <section aria-labelledby="order-details">
        <h2 id="order-details" style={{ marginBottom: 14, fontSize: "1.4rem" }}>
          Where should we reach you?
        </h2>
        <div className="form-grid">
          <div className={`field${errors.facilityName ? " field--invalid" : ""}`}>
            <label htmlFor="order-facility">Facility name</label>
            <input
              id="order-facility"
              type="text"
              autoComplete="organization"
              value={fields.facilityName}
              onChange={(e) => set("facilityName", e.target.value)}
              required
            />
            {errors.facilityName ? (
              <span className="field-error" role="alert">{errors.facilityName}</span>
            ) : null}
          </div>
          <div className={`field${errors.contactName ? " field--invalid" : ""}`}>
            <label htmlFor="order-contact">Contact name</label>
            <input
              id="order-contact"
              type="text"
              autoComplete="name"
              value={fields.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              required
            />
            {errors.contactName ? (
              <span className="field-error" role="alert">{errors.contactName}</span>
            ) : null}
          </div>
          <div className={`field${errors.email ? " field--invalid" : ""}`}>
            <label htmlFor="order-email">Email</label>
            <input
              id="order-email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
            {errors.email ? (
              <span className="field-error" role="alert">{errors.email}</span>
            ) : null}
          </div>
          <div className={`field${errors.phone ? " field--invalid" : ""}`}>
            <label htmlFor="order-phone">Phone</label>
            <input
              id="order-phone"
              type="tel"
              autoComplete="tel"
              value={fields.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
            {errors.phone ? (
              <span className="field-error" role="alert">{errors.phone}</span>
            ) : null}
          </div>
          <div className="field field--wide">
            <label htmlFor="order-notes">
              Notes <span className="hint">(optional — timing, questions, anything we should know)</span>
            </label>
            <textarea
              id="order-notes"
              rows={4}
              value={fields.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        {/* honeypot */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="order-website">Website</label>
          <input
            id="order-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </section>

      {status === "error" ? (
        <div className="notice notice--error" role="alert">
          {serverError}
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === "sending" || items.length === 0}
        >
          {status === "sending" ? "Sending…" : "Send Order Request"}
        </button>
        <span style={{ fontSize: 13.5, color: "var(--body)" }}>
          No payment now — we&apos;ll confirm everything with you first.
        </span>
      </div>
    </form>
  );
}
