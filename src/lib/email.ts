/**
 * Shared email sender. One provider (Resend, via REST — no SDK), one place.
 * With no RESEND_API_KEY the message is logged to the server console so
 * nothing is silently lost in development or before keys are provisioned.
 */

export function ownerEmail(): string {
  return (
    process.env.OWNER_EMAIL ||
    process.env.NEXT_PUBLIC_OWNER_EMAIL ||
    "owner@ascendseniorconsulting.com"
  );
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(
      `[email not configured — logging]\nTo: ${opts.to}\nSubject: ${opts.subject}\n${opts.text}`,
    );
    return true;
  }
  const from =
    process.env.EMAIL_FROM || "Ascend Website <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("Email send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send failed (network):", err);
    return false;
  }
}
