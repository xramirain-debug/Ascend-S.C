import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section" style={{ textAlign: "center", padding: "96px 48px" }}>
      <h1 style={{ marginBottom: 12 }}>Page not found</h1>
      <p style={{ maxWidth: "44ch", margin: "0 auto 24px" }}>
        That page doesn&apos;t exist — but everything else is one click away.
      </p>
      <Link href="/" className="btn btn--primary">
        Back to Home
      </Link>
    </div>
  );
}
