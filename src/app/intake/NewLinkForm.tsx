"use client";

import { useState } from "react";
import { site } from "@/data/site";
import { submitForm } from "@/lib/submit";

/** Shown when an intake link is expired or can't be verified. */
export default function NewLinkForm() {
  const [fields, setFields] = useState({ facility: "", name: "", email: "" });
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState("");

  function set(key: keyof typeof fields, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      const next = { ...e };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!fields.facility.trim()) next.facility = "Please enter your facility name.";
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!fields.email.trim() || !/^\S+@\S+\.\S+$/.test(fields.email))
      next.email = "Please enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("sending");
    const result = await submitForm(
      "intake-link",
      { ...fields, reason: "Requested a new facility intake link" },
      honeypot,
    );
    if (result.ok) {
      setStatus("done");
    } else {
      setStatus("error");
      setServerError(result.error ?? "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
        <h2 style={{ marginBottom: 10 }}>Request sent</h2>
        <p style={{ maxWidth: "46ch", margin: "0 auto" }}>
          We&apos;ll send a fresh intake link within one business day. If you
          need it sooner, call {site.phone}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card" style={{ padding: 30 }}>
      <h2 style={{ fontSize: "1.35rem", marginBottom: 18 }}>
        Request a new intake link
      </h2>
      <div className="form-grid">
        <div className={`field field--wide${errors.facility ? " field--invalid" : ""}`}>
          <label htmlFor="link-facility">Facility name</label>
          <input
            id="link-facility"
            type="text"
            autoComplete="organization"
            value={fields.facility}
            onChange={(e) => set("facility", e.target.value)}
            required
            aria-invalid={errors.facility ? true : undefined}
            aria-describedby={errors.facility ? "link-facility-error" : undefined}
          />
          {errors.facility ? (
            <span className="field-error" role="alert" id="link-facility-error">
              {errors.facility}
            </span>
          ) : null}
        </div>
        <div className={`field${errors.name ? " field--invalid" : ""}`}>
          <label htmlFor="link-name">Your name</label>
          <input
            id="link-name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            required
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "link-name-error" : undefined}
          />
          {errors.name ? (
            <span className="field-error" role="alert" id="link-name-error">
              {errors.name}
            </span>
          ) : null}
        </div>
        <div className={`field${errors.email ? " field--invalid" : ""}`}>
          <label htmlFor="link-email">Email</label>
          <input
            id="link-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "link-email-error" : undefined}
          />
          {errors.email ? (
            <span className="field-error" role="alert" id="link-email-error">
              {errors.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="link-website">Website</label>
        <input
          id="link-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {status === "error" ? (
        <div className="notice notice--error" role="alert" style={{ marginTop: 16 }}>
          {serverError}
        </div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <button type="submit" className="btn btn--primary" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Request a New Link"}
        </button>
      </div>
    </form>
  );
}
