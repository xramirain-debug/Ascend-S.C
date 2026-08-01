"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  addToSelection,
  clearSelection,
  getSelection,
  onSelectionChange,
  removeFromSelection,
} from "@/lib/order-store";

/**
 * Cart context over the localStorage selection store. Quantity is locked to
 * one per item — every binder set is populated to a single facility. The same
 * selection feeds both paths: Stripe Checkout and the order-request form.
 */

interface CartContextValue {
  ids: string[];
  count: number;
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue>({
  ids: [],
  count: 0,
  add: () => {},
  remove: () => {},
  clear: () => {},
  has: () => false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(getSelection());
    sync();
    return onSelectionChange(sync);
  }, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return (
    <CartContext.Provider
      value={{
        ids,
        count: ids.length,
        add: addToSelection,
        remove: removeFromSelection,
        clear: clearSelection,
        has,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  return useContext(CartContext);
}
