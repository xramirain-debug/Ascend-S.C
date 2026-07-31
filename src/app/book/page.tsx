import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { consultationTypes, site } from "@/data/site";
import BookingForm from "./BookingForm";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book a consultation with Ascend Senior Consulting — compliance consultations, mock survey inquiries, post-survey correction support, and binder working sessions for Minnesota providers.",
};

const typeDescriptions: Record<string, string> = {
  "Compliance Consultation":
    "Talk through where you stand and what needs attention — licensing, policies, systems.",
  "Mock Survey Inquiry":
    "Scope a practice survey for your building before MDH schedules the real one.",
  "Post-Survey Correction Support":
    "Turn citations into a plan of correction that actually closes.",
  "Binder Working Session":
    "Sit down together on your binder set — intake, review, or updates.",
};

export default function BookPage() {
  /* Drop-in scheduler: set NEXT_PUBLIC_SCHEDULER_URL to an embeddable
     scheduling link and the request form is replaced by the live calendar. */
  const schedulerUrl = process.env.NEXT_PUBLIC_SCHEDULER_URL;

  return (
    <>
      <PageHero
        eyebrow="Booking"
        title="Book an Appointment"
        lede="Pick the kind of conversation you need — if you're not sure, choose Compliance Consultation and we'll figure it out together."
      />
      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        <div className="grid-2" style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
          {consultationTypes.map((t) => (
            <div key={t} className="card" style={{ padding: "22px 24px" }}>
              <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>{t}</h2>
              <p style={{ fontSize: 14.5 }}>{typeDescriptions[t]}</p>
            </div>
          ))}
        </div>

        {schedulerUrl ? (
          <div style={{ maxWidth: 980, margin: "0 auto", width: "100%" }}>
            <h2 style={{ marginBottom: 14, textAlign: "center" }}>
              Pick a time
            </h2>
            <iframe
              src={schedulerUrl}
              title="Schedule an appointment"
              style={{
                width: "100%",
                height: 700,
                border: "1px solid var(--line)",
                borderRadius: "var(--radius)",
                background: "#fff",
              }}
            />
            <p style={{ marginTop: 12, fontSize: 14, textAlign: "center" }}>
              Prefer the phone? Call{" "}
              <a href={site.phoneHref} style={{ fontWeight: 600 }}>
                {site.phone}
              </a>
              .
            </p>
          </div>
        ) : (
          <div style={{ maxWidth: 780, margin: "0 auto", width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <h2>Request a time</h2>
              <p style={{ marginTop: 8 }}>
                Tell us what works and we&apos;ll confirm within one business
                day — or call{" "}
                <a href={site.phoneHref} style={{ fontWeight: 600 }}>
                  {site.phone}
                </a>{" "}
                to book directly.
              </p>
            </div>
            <BookingForm />
          </div>
        )}
      </div>
    </>
  );
}
