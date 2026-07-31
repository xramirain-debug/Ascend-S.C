"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addToSelection,
  getSelection,
  onSelectionChange,
} from "@/lib/order-store";

export default function AddToOrderButton({
  id,
  label = "Order this binder",
}: {
  id: string;
  label?: string;
}) {
  const [added, setAdded] = useState(false);
  const justClicked = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const sync = () => setAdded(getSelection().includes(id));
    sync();
    return onSelectionChange(sync);
  }, [id]);

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
          <span className="badge">Added to your order</span>
          <Link href="/order" className="btn btn--primary" ref={linkRef}>
            Start your order
          </Link>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            justClicked.current = true;
            addToSelection(id);
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
