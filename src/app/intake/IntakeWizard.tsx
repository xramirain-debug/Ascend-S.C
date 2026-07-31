"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildSubmission,
  buildSummaryText,
  displayValue,
  PRIVACY_NOTE,
  validateStep,
  visibleFields,
  visibleSteps,
  type Answers,
  type FieldDef,
  type StepDef,
} from "./intake-schema";
import { getSelection } from "@/lib/order-store";
import { submitForm } from "@/lib/submit";

const STORAGE_KEY = "ascend-intake-v1";

interface Saved {
  answers: Answers;
  stepIndex: number;
}

function loadSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.answers) return parsed;
    return null;
  } catch {
    return null;
  }
}

export default function IntakeWizard() {
  const [answers, setAnswers] = useState<Answers>({});
  const [stepIndex, setStepIndex] = useState(0); // index into pages (steps + review)
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "loading" | "editing" | "sending" | "done" | "error"
  >("loading");
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [resumed, setResumed] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  /* load saved progress (and prefill binder selection from the order flow) */
  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      setAnswers(saved.answers);
      setStepIndex(saved.stepIndex);
      setResumed(true);
    } else {
      const orderIds = getSelection();
      if (orderIds.length > 0) {
        setAnswers({ bindersOrdered: orderIds });
      }
    }
    setStatus("editing");
  }, []);

  /* persist progress (also while showing a submit error — the user can
     still edit, and those edits must survive a reload) */
  useEffect(() => {
    if (status === "loading" || status === "sending" || status === "done") return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ answers, stepIndex } satisfies Saved),
      );
    } catch {
      /* storage full/unavailable — resume just won't work */
    }
  }, [answers, stepIndex, status]);

  const stepsNow = useMemo(() => visibleSteps(answers), [answers]);
  const totalPages = stepsNow.length + 1; // + review
  const pageIndex = Math.min(stepIndex, totalPages - 1);
  const isReview = pageIndex === stepsNow.length;
  const currentStep: StepDef | null = isReview ? null : stepsNow[pageIndex];

  /* after a failed submit, any interaction returns the wizard to editing
     and clears the stale error banner */
  function resumeEditing() {
    setStatus((s) => (s === "error" ? "editing" : s));
    setServerError("");
  }

  function setAnswer(id: string, value: string | string[]) {
    resumeEditing();
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  }

  function scrollTop() {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    topRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  function goNext() {
    resumeEditing();
    if (currentStep) {
      const errs = validateStep(currentStep, answers);
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        const first = document.getElementById(
          `intake-${Object.keys(errs)[0]}`,
        );
        if (first) {
          first.focus();
          first.scrollIntoView({ behavior: "auto", block: "center" });
        }
        return;
      }
    }
    setErrors({});
    setStepIndex(pageIndex + 1);
    scrollTop();
  }

  function goBack() {
    resumeEditing();
    setErrors({});
    setStepIndex(Math.max(0, pageIndex - 1));
    scrollTop();
  }

  function jumpTo(i: number) {
    resumeEditing();
    setErrors({});
    setStepIndex(i);
    scrollTop();
  }

  function startOver() {
    if (
      !window.confirm(
        "Clear all intake answers and start over? This cannot be undone.",
      )
    )
      return;
    window.localStorage.removeItem(STORAGE_KEY);
    setAnswers({});
    setStepIndex(0);
    setErrors({});
    setResumed(false);
  }

  async function handleSubmit() {
    /* final validation across every visible step */
    for (let i = 0; i < stepsNow.length; i++) {
      const errs = validateStep(stepsNow[i], answers);
      if (Object.keys(errs).length > 0) {
        setStepIndex(i);
        setErrors(errs);
        scrollTop();
        return;
      }
    }
    setStatus("sending");
    setServerError("");
    const result = await submitForm("intake", buildSubmission(answers), honeypot);
    if (result.ok) {
      window.localStorage.removeItem(STORAGE_KEY);
      setStatus("done");
      scrollTop();
    } else {
      setStatus("error");
      setServerError(result.error ?? "Something went wrong.");
    }
  }

  function downloadSummary() {
    const blob = new Blob([buildSummaryText(answers)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascend-facility-intake-summary.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (status === "loading") {
    return <p aria-live="polite">Loading your intake…</p>;
  }

  /* ── confirmation ─────────────────────────────────────────────── */
  if (status === "done") {
    return (
      <div ref={topRef} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div className="card" style={{ textAlign: "center", padding: "40px 32px" }}>
          <h2 style={{ marginBottom: 10 }}>Intake received — thank you</h2>
          <p style={{ maxWidth: "52ch", margin: "0 auto 20px" }}>
            We&apos;ll review your intake and schedule your working session.
            Keep a copy of your answers for your records:
          </p>
          <div
            className="no-print"
            style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}
          >
            <button type="button" className="btn btn--primary" onClick={downloadSummary}>
              Download summary
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => window.print()}
            >
              Print summary
            </button>
          </div>
        </div>
        <SummaryView answers={answers} />
      </div>
    );
  }

  /* ── wizard ───────────────────────────────────────────────────── */
  const progressPct = Math.round(((pageIndex + 1) / totalPages) * 100);

  return (
    <div ref={topRef} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {resumed ? (
        <div className="notice notice--ok no-print" role="status">
          Welcome back — your earlier answers were saved on this device.{" "}
          <button
            type="button"
            className="text-link"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={startOver}
          >
            Start over instead
          </button>
        </div>
      ) : null}

      {/* progress */}
      <div className="no-print">
        <div className="step-dots" style={{ marginBottom: 12 }}>
          {stepsNow.map((s, i) => (
            <span
              key={s.id}
              className={`step-dot${
                i === pageIndex
                  ? " step-dot--current"
                  : i < pageIndex
                    ? " step-dot--done"
                    : ""
              }`}
            >
              <span className="n" aria-hidden="true">
                {i < pageIndex ? "✓" : i + 1}
              </span>
              {s.shortTitle}
            </span>
          ))}
          <span
            className={`step-dot${isReview ? " step-dot--current" : ""}`}
          >
            <span className="n" aria-hidden="true">
              {stepsNow.length + 1}
            </span>
            Review
          </span>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Intake progress: ${progressPct}%`}
        >
          <div style={{ width: `${progressPct}%` }} />
        </div>
        <p style={{ marginTop: 8, fontSize: 13 }} aria-hidden="true">
          Step {pageIndex + 1} of {totalPages} · Your progress saves
          automatically on this device.
        </p>
      </div>

      {/* privacy — prominent on step 1, persistent reminder afterwards */}
      {pageIndex === 0 ? (
        <div className="notice notice--privacy" role="note">
          <strong>Privacy first:</strong> {PRIVACY_NOTE}
        </div>
      ) : (
        <p className="notice notice--privacy" role="note" style={{ padding: "10px 16px", fontSize: 13.5 }}>
          Reminder: {PRIVACY_NOTE}
        </p>
      )}

      {currentStep ? (
        <StepForm
          key={currentStep.id}
          step={currentStep}
          answers={answers}
          errors={errors}
          onChange={setAnswer}
        />
      ) : (
        <ReviewScreen
          answers={answers}
          steps={stepsNow}
          onEdit={jumpTo}
          onDownload={downloadSummary}
        />
      )}

      {/* honeypot */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="intake-website">Website</label>
        <input
          id="intake-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {Object.keys(errors).length > 0 ? (
        <div className="notice notice--error" role="alert">
          Please fill in the highlighted fields before continuing.
        </div>
      ) : null}
      {status === "error" ? (
        <div className="notice notice--error" role="alert">
          {serverError}
        </div>
      ) : null}

      {/* navigation */}
      <div
        className="no-print"
        style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}
      >
        <button
          type="button"
          className="btn btn--secondary"
          onClick={goBack}
          disabled={pageIndex === 0}
        >
          Back
        </button>
        {isReview ? (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Submitting…" : "Submit Intake"}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={goNext}>
            {pageIndex === stepsNow.length - 1 ? "Review Answers" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ── step renderer ───────────────────────────────────────────────── */

function StepForm({
  step,
  answers,
  errors,
  onChange,
}: {
  step: StepDef;
  answers: Answers;
  errors: Record<string, string>;
  onChange: (id: string, value: string | string[]) => void;
}) {
  return (
    <form
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: 22, padding: 30 }}
      onSubmit={(e) => e.preventDefault()}
      noValidate
    >
      <div>
        <h2 style={{ marginBottom: 6 }}>{step.title}</h2>
        <p style={{ fontSize: 14.5 }}>{step.desc}</p>
      </div>
      {step.groups.map((group, gi) => (
        <div key={gi} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {group.title ? (
            <h3
              style={{
                fontSize: 15,
                fontFamily: "var(--font-sans)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "var(--sage-dark)",
                borderBottom: "1px solid var(--line)",
                paddingBottom: 8,
              }}
            >
              {group.title}
            </h3>
          ) : null}
          <div className="form-grid">
            {group.fields
              .filter((f) => !f.showIf || f.showIf(answers))
              .map((f) => (
                <Field
                  key={f.id}
                  field={f}
                  answers={answers}
                  error={errors[f.id]}
                  onChange={onChange}
                />
              ))}
          </div>
        </div>
      ))}
    </form>
  );
}

function Field({
  field,
  answers,
  error,
  onChange,
}: {
  field: FieldDef;
  answers: Answers;
  error?: string;
  onChange: (id: string, value: string | string[]) => void;
}) {
  const value = answers[field.id];
  const inputId = `intake-${field.id}`;
  const wide =
    field.type === "textarea" ||
    field.type === "checkboxes" ||
    field.type === "radio";
  const cls = `field${error ? " field--invalid" : ""}${wide ? " field--wide" : ""}`;

  const hint = field.hint ? (
    <span className="hint" id={`${inputId}-hint`}>
      {field.hint}
    </span>
  ) : null;
  const errorEl = error ? (
    <span className="field-error" role="alert" id={`${inputId}-error`}>
      {error}
    </span>
  ) : null;
  const describedBy =
    [field.hint ? `${inputId}-hint` : null, error ? `${inputId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  if (field.type === "checkboxes") {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (v: string, on: boolean) =>
      onChange(field.id, on ? [...selected, v] : selected.filter((x) => x !== v));
    return (
      <fieldset
        className={cls}
        id={inputId}
        tabIndex={-1}
        aria-describedby={describedBy}
      >
        <legend className="field__legend">
          {field.label}
          {field.required ? " *" : ""}
        </legend>
        {hint}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {field.options?.map((o) => (
            <label key={o.value} className="choice-row">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={(e) => toggle(o.value, e.target.checked)}
              />
              <span>{o.label}</span>
            </label>
          ))}
          {field.allowOther ? (
            <label className="choice-row" style={{ alignItems: "center" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Other:</span>
              <input
                type="text"
                aria-label={`${field.label} — other`}
                value={typeof answers[field.id + "Other"] === "string" ? (answers[field.id + "Other"] as string) : ""}
                onChange={(e) => onChange(field.id + "Other", e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #d3d0c4",
                  borderRadius: 6,
                  fontSize: 14.5,
                  flex: 1,
                }}
              />
            </label>
          ) : null}
        </div>
        {errorEl}
      </fieldset>
    );
  }

  if (field.type === "radio") {
    const current = typeof value === "string" ? value : "";
    return (
      <fieldset
        className={cls}
        id={inputId}
        tabIndex={-1}
        aria-describedby={describedBy}
      >
        <legend className="field__legend">
          {field.label}
          {field.required ? " *" : ""}
        </legend>
        {hint}
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 4 }}>
          {field.options?.map((o) => (
            <label key={o.value} className="choice-row" style={{ alignItems: "center" }}>
              <input
                type="radio"
                name={inputId}
                checked={current === o.value}
                onChange={() => onChange(field.id, o.value)}
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        {errorEl}
      </fieldset>
    );
  }

  if (field.type === "select") {
    return (
      <div className={cls}>
        <label htmlFor={inputId}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        {hint}
        <select
          id={inputId}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        >
          <option value="">Select…</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {errorEl}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={cls}>
        <label htmlFor={inputId}>
          {field.label}
          {field.required ? " *" : ""}
        </label>
        {hint}
        <textarea
          id={inputId}
          rows={3}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.id, e.target.value)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        />
        {errorEl}
      </div>
    );
  }

  const inputType =
    field.type === "number" ? "number" : field.type;
  return (
    <div className={cls}>
      <label htmlFor={inputId}>
        {field.label}
        {field.required ? " *" : ""}
      </label>
      {hint}
      <input
        id={inputId}
        type={inputType}
        min={field.type === "number" ? 0 : undefined}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.id, e.target.value)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      />
      {errorEl}
    </div>
  );
}

/* ── review & summary ────────────────────────────────────────────── */

function ReviewScreen({
  answers,
  steps,
  onEdit,
  onDownload,
}: {
  answers: Answers;
  steps: StepDef[];
  onEdit: (i: number) => void;
  onDownload: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <h2 style={{ marginBottom: 6 }}>Review your answers</h2>
        <p style={{ fontSize: 14.5 }}>
          Look everything over before submitting. You can download a copy for
          your records —{" "}
          <button
            type="button"
            className="text-link no-print"
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
            onClick={onDownload}
          >
            download summary
          </button>
          .
        </p>
      </div>
      {steps.map((step, i) => (
        <section key={step.id} className="card" aria-labelledby={`review-${step.id}`}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 14,
              marginBottom: 12,
            }}
          >
            <h3 id={`review-${step.id}`} style={{ fontSize: "1.15rem" }}>
              {step.title}
            </h3>
            <button
              type="button"
              className="text-link no-print"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => onEdit(i)}
            >
              Edit
            </button>
          </div>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {visibleFields(step, answers).map((f) => (
              <div key={f.id} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <dt style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14, minWidth: 260, flex: "1 1 260px" }}>
                  {f.label}
                </dt>
                <dd style={{ margin: 0, fontSize: 14.5, color: "var(--body)", flex: "2 1 300px" }}>
                  {displayValue(f, answers)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

function SummaryView({ answers }: { answers: Answers }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="print-only">
        <h1 style={{ fontSize: "1.6rem" }}>
          Ascend Senior Consulting — Facility Intake Summary
        </h1>
      </div>
      {visibleSteps(answers).map((step) => (
        <section key={step.id} className="card">
          <h3 style={{ fontSize: "1.15rem", marginBottom: 12 }}>{step.title}</h3>
          <dl style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
            {visibleFields(step, answers).map((f) => (
              <div key={f.id} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <dt style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14, minWidth: 260, flex: "1 1 260px" }}>
                  {f.label}
                </dt>
                <dd style={{ margin: 0, fontSize: 14.5, color: "var(--body)", flex: "2 1 300px" }}>
                  {displayValue(f, answers)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
