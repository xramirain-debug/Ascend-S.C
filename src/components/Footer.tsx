import Link from "next/link";
import Image from "next/image";
import { site, nav } from "@/data/site";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Image
            src="/ascend-logo.png"
            alt="Ascend Senior Consulting"
            width={230}
            height={54}
            className="site-footer__logo"
          />
          <p style={{ color: "var(--navy-text-soft)", fontSize: 14.5 }}>
            {site.serviceArea}.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <h2>Quick Links</h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14.5,
            }}
          >
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/book">Book an Appointment</Link>
            </li>
            <li>
              <Link href="/intake">Facility Intake</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2>Contact</h2>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14.5,
            }}
          >
            <li>
              <a href={site.phoneHref}>{site.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.ownerEmail}`}>{site.ownerEmail}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="site-footer__bottom">
        <span>
          © {new Date().getFullYear()} Ascend Senior Consulting. All rights
          reserved.
        </span>
        <span>{site.serviceArea}.</span>
      </div>
    </footer>
  );
}
