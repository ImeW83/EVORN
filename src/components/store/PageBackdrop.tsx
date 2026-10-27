import { STORE } from "@/lib/config";

// Quiet decoration for sparse pages (sign in, cart): a faint outlined wordmark and the hero's ring.
// Place inside a `relative overflow-hidden` wrapper, before the content.
export function PageBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      <p className="text-outline font-display absolute bottom-0 -left-6 text-[38vw] leading-none tracking-[0.05em] [--outline-fill:var(--color-cream)] [--outline:color-mix(in_srgb,var(--color-tan)_55%,transparent)] lg:text-[22rem]">
        {STORE.name}
      </p>
      <svg viewBox="0 0 440 440" className="absolute -right-24 -top-10 hidden h-[460px] w-[460px] text-tan/80 md:block" fill="none" stroke="currentColor">
        <circle cx="220" cy="245" r="185" strokeWidth="1.25" />
        <circle cx="220" cy="245" r="172" strokeWidth="0.6" />
        <circle cx="220" cy="245" r="195" strokeWidth="1" strokeDasharray="1 9" />
        <path d="M220 60 192 26l12-16h32l12 16-28 34Z" strokeWidth="1.25" />
        <path d="M192 26h56M204 10l16 16 16-16M220 26v34" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
