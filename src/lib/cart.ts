"use client";

import { useSyncExternalStore } from "react";

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
};

const KEY = "evorn_cart";
const EMPTY: CartLine[] = [];
let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) ?? "[]");
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
  add(line: Omit<CartLine, "quantity">, quantity = 1) {
    const lines = read();
    const existing = lines.find((l) => l.productId === line.productId);
    write(
      existing
        ? lines.map((l) => (l === existing ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l))
        : [...lines, { ...line, quantity }],
    );
  },
  setQuantity(productId: number, quantity: number) {
    write(
      quantity <= 0
        ? read().filter((l) => l.productId !== productId)
        : read().map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, 20) } : l)),
    );
  },
  remove(productId: number) {
    write(read().filter((l) => l.productId !== productId));
  },
  clear() {
    write([]);
  },
};
