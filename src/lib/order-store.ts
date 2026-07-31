"use client";

/**
 * Order selection ("cart") persisted in localStorage. Kept deliberately
 * simple: a list of item ids (products or bundles). Prices always come from
 * the catalog at render time, never from storage.
 */

const KEY = "ascend-order-selection";
const EVENT = "ascend-order-change";

export function getSelection(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  window.localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function addToSelection(id: string) {
  const ids = getSelection();
  if (!ids.includes(id)) save([...ids, id]);
}

export function removeFromSelection(id: string) {
  save(getSelection().filter((x) => x !== id));
}

export function clearSelection() {
  save([]);
}

export function onSelectionChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
