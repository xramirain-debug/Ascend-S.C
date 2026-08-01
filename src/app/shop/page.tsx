import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import AddToOrderButton from "@/components/AddToOrderButton";
import {
  bundles,
  formatPrice,
  productsInSection,
  sectionMeta,
  type ProductSection,
} from "@/data/catalog";

export const metadata: Metadata = {
  title: "Binder Shop — Facility-Customized Compliance Binders",
  description:
    "Compliance binders populated to your Minnesota assisted living facility: policies, forms, survey readiness, emergency preparedness, QAPI, HIPAA, and more. Bundles available.",
};

const sectionOrder: ProductSection[] = [
  "governance",
  "operations",
  "people",
  "addons",
];

export default function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="The Binder Library"
        title="Compliance Binders, Populated to Your Facility"
        lede="These aren't template packs. Every set is built to your license, your building, and your people — then delivered organized the way surveyors ask for it."
      />

      <div className="section" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        <div
          className="notice notice--privacy"
          style={{ maxWidth: 780, margin: "0 auto", textAlign: "center" }}
        >
          <strong>How ordering works:</strong> select your binders, send the
          order request, and we&apos;ll reach out within one business day to
          begin your facility intake. Your set is populated to your facility
          before it ships — nothing here is instant-download.
        </div>

        {sectionOrder.map((section) => {
          const meta = sectionMeta[section];
          const items = productsInSection(section);
          return (
            <section key={section} aria-labelledby={`shop-${section}`}>
              <div style={{ marginBottom: 20 }}>
                <h2 id={`shop-${section}`}>{meta.title}</h2>
                {meta.note ? (
                  <p style={{ marginTop: 4, fontStyle: "italic", fontSize: 14.5 }}>
                    {meta.note}
                  </p>
                ) : null}
              </div>
              <div className="grid-3">
                {items.map((p) => (
                  <div key={p.id} className="card product-card">
                    <h3>{p.name}</h3>
                    <p className="blurb">{p.blurb}</p>
                    <div className="card-actions">
                      <span className="price">{formatPrice(p.price)}</span>
                      <Link href={`/shop/${p.id}`} className="text-link">
                        View details →
                      </Link>
                    </div>
                    <AddToOrderButton id={p.id} />
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {/* bundles */}
        <section aria-labelledby="shop-bundles">
          <div style={{ marginBottom: 20 }}>
            <h2 id="shop-bundles">Bundles</h2>
            <p style={{ marginTop: 4, fontSize: 14.5 }}>
              The most common combinations, priced as a set.
            </p>
          </div>
          <div className="grid-3">
            {bundles.map((b) => (
              <div
                key={b.id}
                className="card product-card"
                style={{ borderColor: "var(--sage)", borderWidth: 1.5 }}
              >
                <span className="badge">Bundle</span>
                <h3>{b.name}</h3>
                <p className="blurb">{b.blurb}</p>
                <ul className="bullet-list" style={{ fontSize: 14 }}>
                  {b.contents.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
                <div className="card-actions">
                  <span className="price">
                    {formatPrice(b.price)}{" "}
                    <span className="price-struck">
                      <span className="sr-only">à la carte </span>
                      {formatPrice(b.alaCartePrice)}
                    </span>
                  </span>
                  <Link href={`/shop/${b.id}`} className="text-link">
                    View details →
                  </Link>
                </div>
                <AddToOrderButton id={b.id} label="Add bundle to cart" />
              </div>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center" }}>
          <Link href="/order" className="btn btn--primary">
            Start an Order
          </Link>
        </div>
      </div>
    </>
  );
}
