import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import PhotoSlot from "@/components/PhotoSlot";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Ascend Senior Consulting — founded by an RN and Licensed Assisted Living Director with 22 years in senior care, serving Minnesota assisted living and home care providers.",
};

const credentials = [
  "Registered Nurse (RN)",
  "Licensed Assisted Living Director (LALD)",
  "22 years in senior care",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Grounded, Honest, Solutions-Focused"
        lede="Providers don't need more theory — they need solutions that work. That belief is where Ascend started."
      />
      <div className="section split" style={{ alignItems: "start" }}>
        {/* TODO(owner): replace this slot with the real headshot —
            drop the photo in /public and swap PhotoSlot for <Image>. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <PhotoSlot label="founder headshot — TODO replace" minHeight={420} />
          <div className="card" style={{ background: "var(--paper)" }}>
            <p className="eyebrow" style={{ marginBottom: 10 }}>
              Credentials
            </p>
            <ul className="bullet-list" style={{ fontWeight: 600, color: "var(--navy)" }}>
              {credentials.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <h2>The Practice</h2>
          {/* TODO(owner): the practice story goes here — how Ascend came to
              be, the moments that shaped how you work, and what providers can
              expect when they call. Keep the voice plain and warm; the
              paragraphs below are structural placeholders. */}
          <p>
            [TODO — opening paragraph: how Ascend began and why. What you kept
            seeing in buildings that made you start this practice.]
          </p>
          <p>
            [TODO — middle paragraph: the work itself. The kinds of providers
            you partner with and how an engagement actually feels — practical,
            collaborative, no lectures.]
          </p>
          <p>
            [TODO — closing paragraph: what you believe good senior care
            leadership looks like, and the standard you hold your own work to.]
          </p>

          <div
            className="card"
            style={{ background: "var(--sage-light)", border: "1px solid #d5d2b8" }}
          >
            <p style={{ color: "#3c3c2a", fontWeight: 600 }}>
              Every engagement starts with a conversation — about your building,
              your team, and what&apos;s keeping you up at night.
            </p>
          </div>
          <div>
            <Link href="/book" className="btn btn--primary">
              Book a Consultation
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
