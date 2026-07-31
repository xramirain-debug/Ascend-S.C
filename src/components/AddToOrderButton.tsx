"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  addToSelection,
  getSelection,
  onSelectionChange,
} from "@/lib/order-store";

export default function AddToOrderButton({ id }: { id: string }) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const sync = () => setAdded(getSelection().includes(id));
    sync();
    return onSelectionChange(sync);
  }, [id]);

  if (added) {
    return (
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span className="badge">Added to your order</span>
        <Link href="/order" className="btn btn--primary">
          Start your order
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="btn btn--primary"
      onClick={() => addToSelection(id)}
    >
      Order this binder
    </button>
  );
}
