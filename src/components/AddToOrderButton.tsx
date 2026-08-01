"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function AddToOrderButton({
  id,
  label = "Add to cart",
}: {
  id: string;
  label?: string;
}) {
  const { has, add } = useCart();
  const added = has(id);
  const justClicked = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  /* keep keyboard users oriented: when the button they activated is
     replaced, move focus to the next action */
  useEffect(() => {
    if (added && justClicked.current) {
      justClicked.current = false;
      linkRef.current?.focus();
    }
  }, [added]);

  return (
    <div aria-live="polite">
      {added ? (
        <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge">In your cart</span>
          <Link href="/cart" className="btn btn--primary" ref={linkRef}>
            View cart
          </Link>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            justClicked.current = true;
            add(id);
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
