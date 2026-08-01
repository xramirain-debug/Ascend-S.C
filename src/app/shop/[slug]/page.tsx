import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToOrderButton from "@/components/AddToOrderButton";
import {
  bundles,
  formatPrice,
  getBundle,
  getProduct,
  products,
  sectionMeta,
} from "@/data/catalog";

export function generateStaticParams() {
  return [
    ...products.map((p) => ({ slug: p.id })),
    ...bundles.map((b) => ({ slug: b.id })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getProduct(slug) ?? getBundle(slug);
  if (!item) return {};
  return {
    title: `${item.name} — ${formatPrice(item.price)}`,
    description: item.blurb,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  const bundle = product ? undefined : getBundle(slug);
  if (!product && !bundle) notFound();

  const item = (product ?? bundle)!;

  return (
    <>
      <div className="section section--tight" style={{ paddingBottom: 0 }}>
        <Link href="/shop" className="text-link">
          ← Back to the Binder Library
        </Link>
      </div>

      <div className="section" style={{ paddingTop: 24 }}>
        <div className="split" style={{ alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {product ? (
              <span className="badge">{sectionMeta[product.section].title}</span>
            ) : (
              <span className="badge">Bundle</span>
            )}
            <h1 style={{ fontSize: "clamp(1.9rem, 3.5vw, 2.4rem)" }}>
              {item.name}
            </h1>
            {(product?.description ?? bundle?.description ?? []).map((d) => (
              <p key={d} style={{ fontSize: 16 }}>
                {d}
              </p>
            ))}
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 700,
                  color: "var(--navy)",
                }}
              >
                {formatPrice(item.price)}
              </span>
              {bundle ? (
                <span className="price-struck" style={{ fontSize: 17 }}>
                  à la carte {formatPrice(bundle.alaCartePrice)}
                </span>
              ) : null}
            </div>
            <div>
              <AddToOrderButton
                id={item.id}
                label={bundle ? "Add bundle to cart" : "Add to cart"}
              />
            </div>
            <p style={{ fontSize: 13.5 }}>
              Every set is populated to your facility, so your facility intake
              comes next — pay by card at checkout, or send an order request if
              your building pays by check.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <h2 style={{ fontSize: "1.25rem", marginBottom: 12 }}>
                {bundle ? "What's in this bundle" : "What's inside"}
              </h2>
              <ul className="bullet-list">
                {(product?.contents ?? bundle?.contents ?? []).map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              {bundle?.contentsNote ? (
                <p style={{ marginTop: 12, fontSize: 13.5, fontStyle: "italic" }}>
                  {bundle.contentsNote}
                </p>
              ) : null}
            </div>

            {product ? (
              <div className="grid-2" style={{ gap: 18 }}>
                <div className="card" style={{ background: "var(--paper)" }}>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>
                    What&apos;s customized to your facility
                  </h2>
                  <ul className="bullet-list" style={{ fontSize: 14 }}>
                    {product.customized.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div className="card" style={{ background: "var(--paper)" }}>
                  <h2 style={{ fontSize: "1.1rem", marginBottom: 10 }}>
                    What we maintain
                  </h2>
                  <ul className="bullet-list" style={{ fontSize: 14 }}>
                    {product.maintained.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
