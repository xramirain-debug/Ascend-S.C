import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import { site } from "@/data/site";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Ascend Senior Consulting — 651.260.0248. Serving assisted living and home care providers across Minnesota.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's Talk"
        lede="Questions about a survey, a binder, or where to start? Call, or send a message and we'll respond within one business day."
      />
      <div className="section contact-grid">
        <ContactForm />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card" style={{ background: "var(--paper)" }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>
              Phone
            </p>
            <a
              href={site.phoneHref}
              style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)" }}
            >
              {site.phone}
            </a>
          </div>
          <div className="card" style={{ background: "var(--paper)" }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>
              Email
            </p>
            <a
              href={`mailto:${site.ownerEmail}`}
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "var(--navy)",
                wordBreak: "break-all",
              }}
            >
              {site.ownerEmail}
            </a>
          </div>
          <div className="card" style={{ background: "var(--paper)" }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>
              Service area
            </p>
            <p style={{ fontSize: 14.5 }}>
              Minnesota — assisted living and home care providers statewide.
            </p>
          </div>
          <div className="card" style={{ background: "var(--paper)" }}>
            <p className="eyebrow" style={{ marginBottom: 6 }}>
              Response time
            </p>
            <p style={{ fontSize: 14.5 }}>
              Messages are answered within one business day.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
