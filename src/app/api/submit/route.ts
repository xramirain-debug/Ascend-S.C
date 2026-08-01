import { NextRequest, NextResponse } from "next/server";
import { ownerEmail, sendEmail } from "@/lib/email";
import { getStore } from "@/lib/store";
import { site } from "@/data/site";

/**
 * Single submission handler for every form on the site:
 * contact · booking request · order request · facility intake ·
 * intake-link resend.
 *
 * Email is the system of record; a storage adapter persists orders and
 * intakes when one is configured (see src/lib/store.ts).
 */

const KINDS = [
  "contact",
  "booking",
  "order",
  "intake",
  "intake-link",
] as const;
type Kind = (typeof KINDS)[number];

const SUBJECTS: Record<Kind, string> = {
  contact: "New contact message",
  booking: "New consultation request",
  order: "New binder order request",
  intake: "New facility intake submission",
  "intake-link": "Intake link resend requested",
};

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

/** Best-effort dig for a value nested anywhere in the intake payload. */
function findValue(data: Record<string, unknown>, needle: string): string {
  for (const v of Object.values(data)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [k2, v2] of Object.entries(v as Record<string, unknown>)) {
        if (k2.toLowerCase().includes(needle) && typeof v2 === "string" && v2 !== "—") {
          return v2;
        }
      }
    }
  }
  return "";
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
  const record = data as Record<string, unknown>;

  /* An intake that came from a paid order carries its order context so the
     owner can match submission to purchase. */
  const orderMeta = record.__order as
    | { sessionId?: string; items?: string[] }
    | undefined;
  const body =
    k === "intake" && orderMeta
      ? [
          "ORDER",
          `Stripe session: ${orderMeta.sessionId ?? "—"}`,
          `Items: ${(orderMeta.items ?? []).join(", ") || "—"}`,
          "",
          renderBody(k, omit(record, "__order")),
        ].join("\n")
      : renderBody(k, omit(record, "__order"));

  const sent = await sendEmail({
    to: ownerEmail(),
    subject: `${SUBJECTS[k]} — Ascend website`,
    text: body,
  });

  if (!sent) {
    return NextResponse.json(
      { error: "We couldn't send your submission. Please call 651.260.0248." },
      { status: 502 },
    );
  }

  if (k === "intake") {
    const clean = omit(record, "__order");
    const facilityName = findValue(clean, "legal facility name") || "your facility";
    await getStore().saveIntake({
      sessionId: orderMeta?.sessionId,
      items: orderMeta?.items,
      facilityName,
      submission: clean,
      createdAt: new Date().toISOString(),
    });

    /* confirmation to the facility — best effort, never blocks the response */
    const contactEmail = findValue(clean, "contact email");
    if (contactEmail) {
      await sendEmail({
        to: contactEmail,
        subject: "We received your facility intake — Ascend Senior Consulting",
        text: [
          `Thank you — we've received the facility intake for ${facilityName}.`,
          "",
          "We'll review your answers and reach out to schedule your working",
          "session. If anything changes in the meantime, just call or reply.",
          "",
          `Questions? Call ${site.phone}.`,
          "— Ascend Senior Consulting",
        ].join("\n"),
      });
    }
  }

  return NextResponse.json({ ok: true });
}

function omit(
  obj: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  if (!(key in obj)) return obj;
  const next = { ...obj };
  delete next[key];
  return next;
}
