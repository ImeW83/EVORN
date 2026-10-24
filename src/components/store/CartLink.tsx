"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="flex items-center gap-2 text-[12px] uppercase tracking-[0.2em] hover:text-tan">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 8h14l-1 12H6L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      <span>Cart{count > 0 && ` (${count})`}</span>
    </Link>
  );
}
