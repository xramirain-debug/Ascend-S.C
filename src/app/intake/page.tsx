import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { getOrderable, expandItems } from "@/data/catalog";
import { verifyIntakeToken } from "@/lib/intake-token";
import IntakeWizard from "./IntakeWizard";
import NewLinkForm from "./NewLinkForm";

export const metadata: Metadata = {
  title: "Facility Intake",
  description:
    "Complete your binder customization intake online. Your answers determine how each binder is populated to your facility. Progress saves automatically — no resident information is collected.",
};

export const dynamic = "force-dynamic";

export default async function IntakePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  /* A token is optional: /intake without one is the pre-purchase intake and
     behaves exactly as it always has. */
  const verified = token ? verifyIntakeToken(token) : null;

  if (verified && !verified.ok) {
    const expired = verified.reason === "expired";
    return (
      <>
        <PageHero
          eyebrow="Facility Intake"
          title={expired ? "This link has expired" : "This link isn't valid"}
          lede={
            expired
              ? "Intake links stay active for 30 days. We'll send you a fresh one — it only takes a moment."
              : "We couldn't verify this intake link. Ask us for a new one and we'll send it right over."
          }
        />
        <div
          className="section"
          style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}
        >
          <NewLinkForm />
        </div>
      </>
    );
  }

  const payload = verified?.ok ? verified.payload : null;
  const purchasedItems = payload ? expandItems(payload.items) : null;
  const purchasedNames = payload
    ? payload.items
        .map((id) => getOrderable(id)?.name)
        .filter((n): n is string => Boolean(n))
    : [];

  return (
    <>
      <div className="no-print">
        <PageHero
          eyebrow="Binder Customization"
          title="Facility Intake"
          lede={
            payload
              ? "Your order is confirmed — this is the part that makes the binders yours. We've filled in what we already know, and you'll only see the sections your order calls for. Progress saves automatically, so you can step away and come back."
              : "Your answers here are what make your binders yours — names, license details, building specifics. Only the sections that apply to your order will appear. Progress saves automatically, so you can step away and come back."
          }
        />
      </div>
      <div
        className="section"
        style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}
      >
        <IntakeWizard
          order={
            payload
              ? {
                  sessionId: payload.sid,
                  items: payload.items,
                  expandedItems: purchasedItems!,
                  itemNames: purchasedNames,
                  email: payload.email,
                  facility: payload.facility ?? "",
                }
              : null
          }
        />
      </div>
    </>
  );
}
