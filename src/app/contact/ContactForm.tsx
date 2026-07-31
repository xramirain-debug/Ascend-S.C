"use client";

import { useState } from "react";
import { submitForm } from "@/lib/submit";

interface Fields {
  name: string;
  facility: string;
  email: string;
  message: string;
}

const empty: Fields = { name: "", facility: "", email: "", message: "" };

export default function ContactForm() {
  const [fields, setFields] = useState<Fields>(empty);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");

  function set<K extends keyof Fields>(key: K, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!fields.facility.trim()) next.facility = "Please enter your facility or organization.";
    if (!fields.email.trim() || !/^\S+@\S+\.\S+$/.test(fields.email))
      next.email = "Please enter a valid email address so we can reply.";
    if (!fields.message.trim()) next.message = "Please enter a message.";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    const result = await submitForm("contact", { ...fields }, honeypot);
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
        <h2 style={{ marginBottom: 10 }}>Message sent</h2>
        <p style={{ maxWidth: "46ch", margin: "0 auto" }}>
          Thank you — we&apos;ll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card" style={{ padding: 30 }}>
      <h2 style={{ fontSize: "1.4rem", marginBottom: 18 }}>Send a message</h2>
      <div className="form-grid">
        <div className={`field${errors.name ? " field--invalid" : ""}`}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          {errors.name ? <span className="field-error" role="alert">{errors.name}</span> : null}
        </div>
        <div className={`field${errors.facility ? " field--invalid" : ""}`}>
          <label htmlFor="contact-facility">Facility / organization</label>
          <input
            id="contact-facility"
            type="text"
            autoComplete="organization"
            value={fields.facility}
            onChange={(e) => set("facility", e.target.value)}
            required
          />
          {errors.facility ? (
            <span className="field-error" role="alert">{errors.facility}</span>
          ) : null}
        </div>
        <div className={`field field--wide${errors.email ? " field--invalid" : ""}`}>
          <label htmlFor="contact-email">
            Email <span className="hint">(so we can reply)</span>
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          {errors.email ? <span className="field-error" role="alert">{errors.email}</span> : null}
        </div>
        <div className={`field field--wide${errors.message ? " field--invalid" : ""}`}>
          <label htmlFor="contact-message">Message</label>
          <textarea
            id="contact-message"
            rows={6}
            placeholder="How can we help?"
            value={fields.message}
            onChange={(e) => set("message", e.target.value)}
            required
          />
          {errors.message ? (
            <span className="field-error" role="alert">{errors.message}</span>
          ) : null}
        </div>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
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
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>
      </div>
    </form>
  );
}
