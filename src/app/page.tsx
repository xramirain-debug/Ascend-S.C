import type { Metadata } from "next";
import Link from "next/link";
import PhotoSlot from "@/components/PhotoSlot";
import {
  featuredProductIds,
  formatPrice,
  getProduct,
} from "@/data/catalog";

export const metadata: Metadata = {
  title:
    "Minnesota Assisted Living & Home Care Consulting | Ascend Senior Consulting",
  description:
    "Practical compliance, clinical, and operations consulting for Minnesota assisted living and home care providers — plus a library of facility-customized compliance binders.",
};

const pillars = [
  {
    title: "Regulatory Compliance",
    body: "Mock surveys, readiness assessments, and post-survey correction support. We identify risks, close gaps, and help you build systems that stand up to scrutiny.",
    result: "Reduced survey risk and a confident, well-prepared team.",
  },
  {
    title: "Clinical Practices",
    body: "Staff training, leadership mentoring, quality improvement, and documentation support. We help translate best practices into daily operations.",
    result: "Stronger oversight, confident staff, improved outcomes.",
  },
  {
    title: "Operational Strategies",
    body: "From startup through stabilization — system development, quality improvement, and reimbursement support, so no opportunity is missed.",
    result: "Stronger systems, optimized revenue, empowered teams.",
  },
];

const whyAscend = [
  "Real-world senior care experience",
  "Clear, practical recommendations",
  "Strong understanding of regulations and expectations",
  "Respectful, collaborative consulting style",
];

export default function HomePage() {
  return (
    <>
      {/* hero */}
      <div
        className="section split"
        style={{
          background: "linear-gradient(180deg, var(--paper) 0%, #fff 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <h1>Expert Guidance for Assisted Living &amp; Home Care Providers</h1>
          <p style={{ fontSize: 17, lineHeight: 1.65 }}>
            Practical compliance, clinical, and operations support for Minnesota
            providers — from survey readiness to the systems that keep your
            building running well long after we leave.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/book" className="btn btn--primary">
              Book a Consultation
            </Link>
            <Link href="/shop" className="btn btn--secondary">
              Browse the Binder Library
            </Link>
          </div>
        </div>
        <PhotoSlot label="care team working session" minHeight={360} />
      </div>

      {/* positioning */}
      <div className="section split">
        <PhotoSlot label="reviewing documentation together" minHeight={330} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2>Consulting for Real-World Senior Care Challenges</h2>
          <p>
            Running an assisted living or home care organization is complex.
            Regulations change. Staffing is difficult. Systems must be strong.
            Surveys are stressful.
          </p>
          <p>
            Ascend partners with you to bring clarity, structure, and confidence
            to your operations — whether you are opening a new organization or
            strengthening an existing one.
          </p>
        </div>
      </div>

      {/* service pillars */}
      <div className="section section--tinted">
        <div className="section-head">
          <span className="eyebrow">What We Do</span>
          <h2>Support built around your needs</h2>
          <p>
            Whether you are preparing for a survey, opening a new service, or
            working to stabilize operations, you don&apos;t have to navigate it
            alone.
          </p>
        </div>
        <div className="grid-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="card"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <h3>{p.title}</h3>
              <p style={{ fontSize: 14.5 }}>{p.body}</p>
              <p
                style={{
                  marginTop: "auto",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--sage-dark)",
                }}
              >
                The result? {p.result}
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Link href="/services" className="text-link">
            See all services →
          </Link>
        </div>
      </div>

      {/* why ascend */}
      <div
        className="section split on-dark"
        style={{ background: "var(--navy)", alignItems: "center" }}
      >
        <div>
          <p className="eyebrow" style={{ color: "var(--navy-text-accent)", marginBottom: 10 }}>
            Why Ascend
          </p>
          <h2 style={{ color: "#fff" }}>A Practical, Supportive Approach</h2>
          <p style={{ marginTop: 14, color: "var(--navy-text-soft)" }}>
            Providers don&apos;t need more theory — they need solutions that
            work. Our goal is simple: help you feel confident, prepared, and
            supported.
          </p>
        </div>
        <ul
          className="bullet-list"
          style={{ color: "#e7ecf3", fontWeight: 600, gap: 12 }}
        >
          {whyAscend.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </div>

      {/* binder library teaser */}
      <div className="section">
        <div className="section-head">
          <span className="eyebrow">The Binder Library</span>
          <h2>Compliance binders, populated to your facility</h2>
          <p>
            Not template packs — working binders built to your license, your
            building, and your people, delivered ready for survey day.
          </p>
        </div>
        <div className="grid-3">
          {featuredProductIds.map((id) => {
            const p = getProduct(id);
            if (!p) return null;
            return (
              <div key={p.id} className="card product-card">
                <h3>{p.name}</h3>
                <p className="blurb">{p.blurb}</p>
                <div className="card-actions">
                  <span className="price">{formatPrice(p.price)}</span>
                  <Link href={`/shop/${p.id}`} className="text-link">
                    View details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Link href="/shop" className="btn btn--primary">
            Browse the Binder Library
          </Link>
        </div>
      </div>

      {/* closing CTA */}
      <div className="section section--tight" style={{ paddingTop: 0 }}>
        <div
          className="card"
          style={{
            background: "var(--sage-light)",
            border: "1px solid #d5d2b8",
            textAlign: "center",
            padding: "36px 32px",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>Not sure where to start?</h2>
          <p style={{ marginBottom: 20 }}>
            Book a consultation and we&apos;ll talk through where you are —
            startup, survey prep, or stabilizing operations.
          </p>
          <Link href="/book" className="btn btn--primary">
            Book a Consultation
          </Link>
        </div>
      </div>
    </>
  );
}
