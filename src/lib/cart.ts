"use client";

import { useSyncExternalStore } from "react";
import type { SelectedOption } from "./options";

export type CartLine = {
  key: string; // product id plus the chosen options, so "Size 6" and "Size 7" are separate lines
  productId: string;
  slug: string;
  name: string;
  price: number; // including option extras
  options: SelectedOption[];
  image: string | null;
  quantity: number;
};

const lineKey = (productId: string, options: SelectedOption[]) =>
  [productId, ...options.map((o) => `${o.name}=${o.value}`)].join("|");

const KEY = "evorn_cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const saved: CartLine[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    // Carts saved before the MongoDB move used numeric ids; drop those lines. Lines saved before options existed
    // have no options or key; fill those in.
    cache = saved
      .filter((l) => typeof l.productId === "string")
      .map((l) => ({ ...l, options: l.options ?? [], key: l.key ?? lineKey(l.productId, l.options ?? []) }));
  } catch {
    cache = [];
  }
  return cache!;
}

function write(lines: CartLine[]) {
  cache = lines;
  try {
    localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  return { lines, count, subtotal };
}

export const cart = {
  add(line: Omit<CartLine, "quantity" | "key">, quantity = 1) {
    const lines = read();
    const key = lineKey(line.productId, line.options);
    const existing = lines.find((l) => l.key === key);
    write(
      existing
        ? lines.map((l) => (l === existing ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l))
        : [...lines, { ...line, key, quantity }],
    );
  },
  setQuantity(key: string, quantity: number) {
    write(
      quantity <= 0
        ? read().filter((l) => l.key !== key)
        : read().map((l) => (l.key === key ? { ...l, quantity: Math.min(quantity, 20) } : l)),
    );
  },
  remove(key: string) {
    write(read().filter((l) => l.key !== key));
  },
  clear() {
    write([]);
  },
};
