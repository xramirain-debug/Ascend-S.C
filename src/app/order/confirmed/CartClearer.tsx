"use client";

import { useEffect } from "react";
import { clearSelection } from "@/lib/order-store";

/** After a verified payment, the cart's job is done. */
export default function CartClearer() {
  useEffect(() => {
    clearSelection();
  }, []);
  return null;
}
