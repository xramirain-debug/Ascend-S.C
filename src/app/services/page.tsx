import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PhotoSlot from "@/components/PhotoSlot";

export const metadata: Metadata = {
  title: "Compliance, Clinical & Operations Consulting",
  description:
    "Regulatory compliance, clinical practice, and operational consulting for Minnesota assisted living and home care providers. Mock surveys, post-survey correction, training, and startup support.",
};

const services = [
  {
    id: "regulatory-compliance",
    title: "Regulatory Compliance",
    intro:
      "Surveys shouldn't be a source of dread. We help you know exactly where you stand — and fix what needs fixing before a surveyor finds it.",
    items: [
      "Comprehensive mock surveys",
      "Readiness assessments",
      "Post-survey correction support",
      "Plan of correction help",
    ],
    result: "Reduced survey risk and a confident, well-prepared team.",
    photo: "compliance review at the conference table",
  },
  {
    id: "clinical-practices",
    title: "Clinical Practices",
    intro:
      "Strong clinical systems protect residents and staff alike. We work alongside your team to turn best practices into everyday habits.",
    items: [
      "Staff training",
      "Leadership mentoring",
      "Quality improvement",
      "Documentation",
    ],
    result: "Stronger oversight, confident staff, improved outcomes.",
    photo: "nurse mentoring session",
  },
  {
    id: "operational-strategies",
    title: "Operational Strategies",
    intro:
      "From your first license application to a stabilized, sustainable operation — we help you build the systems that carry the day-to-day.",
    items: [
      "Startup through stabilization",
      "System development",
      "Reimbursement",
    ],
    result: "Stronger systems, optimized revenue, empowered teams.",
    photo: "operations planning session",
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Consulting Tailored to Your Organization"
        lede="Providers don't need more theory — they need solutions that work. Every engagement starts with a conversation about where you are."
      />
      <div
        className="section"
        style={{ display: "flex", flexDirection: "column", gap: 56 }}
      >
        {services.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className="split"
            aria-labelledby={`${s.id}-title`}
          >
            {i % 2 === 1 && <PhotoSlot label={s.photo} minHeight={300} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 id={`${s.id}-title`}>{s.title}</h2>
              <p>{s.intro}</p>
              <ul className="bullet-list">
                {s.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14.5,
                  color: "var(--sage-dark)",
                }}
              >
                The result? {s.result}
              </p>
              <div>
                <Link href="/book" className="btn btn--primary">
                  Book a Consultation
                </Link>
              </div>
            </div>
            {i % 2 === 0 && <PhotoSlot label={s.photo} minHeight={300} />}
          </section>
        ))}

        <div
          className="card"
          style={{
            background: "var(--paper)",
            textAlign: "center",
            padding: "32px",
          }}
        >
          <h3 style={{ marginBottom: 8 }}>Not sure what you need?</h3>
          <p style={{ marginBottom: 18 }}>
            Give us a call at 651.260.0248 or send a message — we&apos;ll help
            you figure out the right starting point.
          </p>
          <Link href="/contact" className="btn btn--secondary">
            Contact Us
          </Link>
        </div>
      </div>
    </>
  );
}
