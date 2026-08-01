import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless, signed intake token — the handoff between a paid Stripe Checkout
 * session and the Facility Intake wizard. HMAC-SHA256 over a base64url JSON
 * payload; no database required. Rotating INTAKE_TOKEN_SECRET invalidates all
 * outstanding links (see README).
 */

export interface IntakeTokenPayload {
  /** Stripe Checkout session id. */
  sid: string;
  /** Ordered catalog item ids (products and/or bundles). */
  items: string[];
  /** Customer email from checkout. */
  email: string;
  /** Facility name if captured (shipping name). */
  facility?: string;
  /** Issued-at, unix seconds. */
  iat: number;
  /** Expiry, unix seconds (30 days from issue). */
  exp: number;
}

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

function secret(): string | null {
  return process.env.INTAKE_TOKEN_SECRET || null;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

function sign(payload: string, key: string): string {
  return b64url(createHmac("sha256", key).update(payload).digest());
}

export function createIntakeToken(
  data: Omit<IntakeTokenPayload, "iat" | "exp">,
): string | null {
  const key = secret();
  if (!key) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: IntakeTokenPayload = {
    ...data,
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  };
  const encoded = b64url(Buffer.from(JSON.stringify(payload), "utf8"));
  return `${encoded}.${sign(encoded, key)}`;
}

export type TokenVerification =
  | { ok: true; payload: IntakeTokenPayload }
  | { ok: false; reason: "unconfigured" | "malformed" | "bad-signature" | "expired" };

export function verifyIntakeToken(token: string): TokenVerification {
  const key = secret();
  if (!key) return { ok: false, reason: "unconfigured" };

  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, reason: "malformed" };
  }
  const [encoded, sig] = parts;

  const expected = Buffer.from(sign(encoded, key));
  const provided = Buffer.from(sig);
  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    return { ok: false, reason: "bad-signature" };
  }

  let payload: IntakeTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed" };
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.sid !== "string" ||
    !Array.isArray(payload.items) ||
    typeof payload.email !== "string" ||
    typeof payload.exp !== "number"
  ) {
    return { ok: false, reason: "malformed" };
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }
  return { ok: true, payload };
}
