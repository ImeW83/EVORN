"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function ShopMenu({ categories }: { categories: { id: string; name: string; slug: string }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 uppercase tracking-[0.2em] hover:text-tan"
      >
        Shop
        <svg viewBox="0 0 12 12" className={`h-2.5 w-2.5 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="m2 4 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <ul role="menu" className="absolute left-0 top-full z-50 min-w-48 border border-cream/15 bg-brown py-2 shadow-lg">
          <li role="none">
            <Link role="menuitem" href="/shop" onClick={() => setOpen(false)} className="block px-5 py-2.5 hover:bg-brown-dark hover:text-tan">
              All jewellery
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.id} role="none">
              <Link role="menuitem" href={`/shop?category=${c.slug}`} onClick={() => setOpen(false)} className="block px-5 py-2.5 hover:bg-brown-dark hover:text-tan">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
