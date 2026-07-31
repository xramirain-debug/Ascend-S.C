"use client";

import { useState } from "react";
import { consultationTypes } from "@/data/site";
import { submitForm } from "@/lib/submit";

interface Fields {
  name: string;
  facility: string;
  phone: string;
  email: string;
  consultationType: string;
  preferredTimes: string;
  notes: string;
}

const empty: Fields = {
  name: "",
  facility: "",
  phone: "",
  email: "",
  consultationType: "",
  preferredTimes: "",
  notes: "",
};

export default function BookingForm() {
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
    if (!fields.phone.trim()) next.phone = "Please enter a phone number.";
    if (!fields.email.trim() || !/^\S+@\S+\.\S+$/.test(fields.email))
      next.email = "Please enter a valid email address.";
    if (!fields.consultationType) next.consultationType = "Please choose a consultation type.";
    if (!fields.preferredTimes.trim())
      next.preferredTimes = "Please share a few days or times that work.";
    setErrors(next);
    return Object.values(next).every((v) => !v);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    const result = await submitForm("booking", { ...fields }, honeypot);
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
        <h2 style={{ marginBottom: 10 }}>Request received</h2>
        <p style={{ maxWidth: "46ch", margin: "0 auto" }}>
          Thank you — we&apos;ll confirm a time within one business day. If
          anything is urgent, call 651.260.0248.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card" style={{ padding: 30 }}>
      <div className="form-grid">
        <div className={`field${errors.name ? " field--invalid" : ""}`}>
          <label htmlFor="book-name">Name</label>
          <input
            id="book-name"
            type="text"
            autoComplete="name"
            value={fields.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          {errors.name ? <span className="field-error" role="alert">{errors.name}</span> : null}
        </div>
        <div className={`field${errors.facility ? " field--invalid" : ""}`}>
          <label htmlFor="book-facility">Facility / organization</label>
          <input
            id="book-facility"
            type="text"
            autoComplete="organization"
            value={fields.facility}
            onChange={(e) => set("facility", e.target.value)}
            required
          />
          {errors.facility ? <span className="field-error" role="alert">{errors.facility}</span> : null}
        </div>
        <div className={`field${errors.phone ? " field--invalid" : ""}`}>
          <label htmlFor="book-phone">Phone</label>
          <input
            id="book-phone"
            type="tel"
            autoComplete="tel"
            value={fields.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
          />
          {errors.phone ? <span className="field-error" role="alert">{errors.phone}</span> : null}
        </div>
        <div className={`field${errors.email ? " field--invalid" : ""}`}>
          <label htmlFor="book-email">Email</label>
          <input
            id="book-email"
            type="email"
            autoComplete="email"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
          {errors.email ? <span className="field-error" role="alert">{errors.email}</span> : null}
        </div>
        <div className={`field field--wide${errors.consultationType ? " field--invalid" : ""}`}>
          <label htmlFor="book-type">Consultation type</label>
          <select
            id="book-type"
            value={fields.consultationType}
            onChange={(e) => set("consultationType", e.target.value)}
            required
          >
            <option value="">Select…</option>
            {consultationTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.consultationType ? (
            <span className="field-error" role="alert">{errors.consultationType}</span>
          ) : null}
        </div>
        <div className={`field field--wide${errors.preferredTimes ? " field--invalid" : ""}`}>
          <label htmlFor="book-times">
            Preferred days / times{" "}
            <span className="hint">(a few options help us confirm faster)</span>
          </label>
          <input
            id="book-times"
            type="text"
            placeholder="e.g. Tuesday or Thursday mornings"
            value={fields.preferredTimes}
            onChange={(e) => set("preferredTimes", e.target.value)}
            required
          />
          {errors.preferredTimes ? (
            <span className="field-error" role="alert">{errors.preferredTimes}</span>
          ) : null}
        </div>
        <div className="field field--wide">
          <label htmlFor="book-notes">
            Notes <span className="hint">(optional)</span>
          </label>
          <textarea
            id="book-notes"
            rows={4}
            value={fields.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="book-website">Website</label>
        <input
          id="book-website"
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
          {status === "sending" ? "Sending…" : "Request Appointment"}
        </button>
      </div>
    </form>
  );
}
