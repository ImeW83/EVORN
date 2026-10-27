"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function SearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = input.current?.value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/shop?q=${encodeURIComponent(q)}`);
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close search" : "Search"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center hover:text-tan"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      </button>
      {open && (
        <form role="search" onSubmit={submit} className="absolute left-0 top-full w-full border-t border-cream/15 bg-brown px-5 py-4">
          <div className="mx-auto flex max-w-2xl gap-3">
            <input
              ref={input}
              type="search"
              name="q"
              placeholder="Search jewellery"
              aria-label="Search jewellery"
              className="min-w-0 flex-1 border border-cream/30 bg-transparent px-4 py-2.5 text-sm normal-case tracking-normal text-cream outline-none placeholder:text-cream/50 focus:border-tan"
            />
            <button className="bg-tan px-6 text-[11px] uppercase tracking-[0.2em] text-brown-dark hover:bg-cream">Search</button>
          </div>
        </form>
      )}
    </>
  );
}
