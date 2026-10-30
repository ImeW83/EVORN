"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Section = { slug: string; name: string; categories: { id: string; name: string; slug: string }[] };

// Shop dropdown: a column for each section (Ladies, Men) listing the categories that have pieces in it.
export function ShopMenu({ sections }: { sections: Section[] }) {
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
        <div
          role="menu"
          className="absolute left-1/2 top-full z-50 grid max-h-[70svh] w-max max-w-[calc(100vw-2.5rem)] -translate-x-1/2 grid-cols-2 overflow-y-auto border border-cream/15 bg-brown py-3 shadow-lg md:left-0 md:translate-x-0"
        >
          {sections.map((s) => (
            <ul key={s.slug} role="group" aria-label={s.name} className="min-w-40 border-cream/15 [&+&]:border-l">
              <li role="none">
                <Link role="menuitem" href={`/shop?for=${s.slug}`} onClick={() => setOpen(false)} className="block px-5 py-2.5 font-display text-lg normal-case tracking-normal text-gold hover:text-cream">
                  {s.name}
                </Link>
              </li>
              {s.categories.map((c) => (
                <li key={c.id} role="none">
                  <Link role="menuitem" href={`/shop?for=${s.slug}&category=${c.slug}`} onClick={() => setOpen(false)} className="block px-5 py-2 hover:bg-brown-dark hover:text-tan">
                    {c.name}
                  </Link>
                </li>
              ))}
              <li role="none">
                <Link role="menuitem" href={`/shop?for=${s.slug}`} onClick={() => setOpen(false)} className="block px-5 py-2 text-cream/70 hover:bg-brown-dark hover:text-tan">
                  All {s.name.toLowerCase()}
                </Link>
              </li>
            </ul>
          ))}
        </div>
      )}
    </div>
  );
}
