"use client";

/**
 * Client helper for the single submission endpoint. Every form on the site
 * (contact, booking request, order request, facility intake) posts here.
 */

export type SubmissionKind =
  | "contact"
  | "booking"
  | "order"
  | "intake"
  | "intake-link";

export interface SubmissionResult {
  ok: boolean;
  error?: string;
}

export async function submitForm(
  kind: SubmissionKind,
  data: Record<string, unknown>,
  honeypot: string,
): Promise<SubmissionResult> {
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, data, website: honeypot }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return {
        ok: false,
        error:
          (body && typeof body.error === "string" && body.error) ||
          "Something went wrong sending your message. Please call 651.260.0248.",
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        "We couldn't reach the server. Please check your connection and try again, or call 651.260.0248.",
    };
  }
}
