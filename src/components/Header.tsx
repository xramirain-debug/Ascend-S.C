"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { nav } from "@/data/site";
import { useCart } from "@/components/CartProvider";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <Link href="/" className="site-header__logo" aria-label="Ascend Senior Consulting — home">
        <Image
          src="/ascend-logo.png"
          alt="Ascend Senior Consulting"
          width={256}
          height={60}
          priority
        />
      </Link>
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls="site-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Close" : "Menu"}
      </button>
      <nav
        id="site-nav"
        className={`site-nav${open ? " open" : ""}`}
        aria-label="Main navigation"
      >
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isCurrent(item.href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/cart"
          className="cart-link"
          aria-current={isCurrent("/cart") ? "page" : undefined}
          aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
          onClick={() => setOpen(false)}
        >
          Cart
          {count > 0 ? (
            <span className="cart-count" aria-hidden="true">
              {count}
            </span>
          ) : null}
        </Link>
        <Link
          href="/book"
          className="btn btn--primary"
          onClick={() => setOpen(false)}
        >
          Book a Consultation
        </Link>
      </nav>
    </header>
  );
}
