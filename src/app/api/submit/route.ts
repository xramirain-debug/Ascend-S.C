import { NextRequest, NextResponse } from "next/server";

/**
 * Single submission handler for every form on the site:
 * contact · booking request · order request · facility intake.
 *
 * Email is sent through Resend's REST API when RESEND_API_KEY is set
 * (no SDK dependency — one HTTPS call). With no key configured, the
 * submission is logged to the server console so nothing is lost in
 * development or before the key is provisioned.
 */

const KINDS = ["contact", "booking", "order", "intake"] as const;
type Kind = (typeof KINDS)[number];

const SUBJECTS: Record<Kind, string> = {
  contact: "New contact message",
  booking: "New consultation request",
  order: "New binder order request",
  intake: "New facility intake submission",
};

function ownerEmail(): string {
  return (
    process.env.OWNER_EMAIL ||
    process.env.NEXT_PUBLIC_OWNER_EMAIL ||
    "owner@ascendseniorconsulting.com"
  );
}

/** Render nested submission data as readable plain text for the email. */
function renderValue(value: unknown, indent = ""): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => renderValue(v, indent)).join(", ");
  }
  if (typeof value === "object") {
    return (
      "\n" +
      Object.entries(value as Record<string, unknown>)
        .map(([k, v]) => `${indent}  ${label(k)}: ${renderValue(v, indent + "  ")}`)
        .join("\n")
    );
  }
  return String(value);
}

function label(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function renderBody(kind: Kind, data: Record<string, unknown>): string {
  const lines = Object.entries(data).map(
    ([k, v]) => `${label(k)}: ${renderValue(v)}`,
  );
  return [
    `${SUBJECTS[kind]} — ascendseniorconsulting.com`,
    "",
    ...lines,
    "",
    `Received: ${new Date().toISOString()}`,
  ].join("\n");
}

async function sendEmail(subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[submission — email not configured]\nSubject: ${subject}\n${text}`);
    return true;
  }
  const from =
    process.env.EMAIL_FROM || "Ascend Website <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [ownerEmail()], subject, text }),
  });
  if (!res.ok) {
    console.error("Email send failed:", res.status, await res.text());
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { kind, data, website } = (payload ?? {}) as {
    kind?: string;
    data?: unknown;
    website?: unknown;
  };

  // Honeypot: real visitors never see this field. Report success so bots
  // don't learn anything, but send nothing.
  if (typeof website === "string" && website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (!kind || !KINDS.includes(kind as Kind)) {
    return NextResponse.json({ error: "Unknown submission type." }, { status: 400 });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ error: "Missing form data." }, { status: 400 });
  }

  // Size guard: nothing on this site legitimately exceeds this.
  if (JSON.stringify(data).length > 100_000) {
    return NextResponse.json({ error: "Submission too large." }, { status: 413 });
  }

  const k = kind as Kind;
  const sent = await sendEmail(
    `${SUBJECTS[k]} — Ascend website`,
    renderBody(k, data as Record<string, unknown>),
  );

  if (!sent) {
    return NextResponse.json(
      { error: "We couldn't send your submission. Please call 651.260.0248." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
