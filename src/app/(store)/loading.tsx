import { STORE } from "@/lib/config";

// Shown while a store page loads. It fades in after a short delay, so quick navigations never flash it.
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="loader fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-brown text-cream">
      <svg aria-hidden viewBox="0 0 440 440" className="h-44 w-44 text-gold" fill="none" stroke="currentColor">
        <circle className="loader-ring" cx="220" cy="245" r="185" strokeWidth="2.5" transform="rotate(-90 220 245)" />
        <g className="loader-gem">
          <path d="M220 60 192 26l12-16h32l12 16-28 34Z" strokeWidth="2.5" />
          <path d="M192 26h56M204 10l16 16 16-16M220 26v34" strokeWidth="1.2" />
        </g>
        <path className="loader-spark" d="M258 10v24M246 22h24" strokeWidth="2" />
      </svg>
      <p className="loader-word font-display text-4xl tracking-[0.35em]">{STORE.name}</p>
      <p className="loader-word text-[11px] uppercase tracking-[0.4em] text-gold">{STORE.tagline}</p>
    </div>
  );
}
