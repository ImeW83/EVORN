import Link from "next/link";
import { STORE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 overflow-hidden bg-brown text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-2xl italic text-gold">{STORE.tagline}</p>
          <p className="mt-3 max-w-xs text-cream/75">Timeless pieces made to be worn, gifted and treasured.</p>
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">Explore</p>
          <ul className="space-y-2 text-cream/80">
            <li><Link href="/shop" className="hover:text-cream">Shop all</Link></li>
            <li><Link href="/shop?sort=newest" className="hover:text-cream">New arrivals</Link></li>
            <li><Link href="/cart" className="hover:text-cream">Your cart</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">Account</p>
          <ul className="space-y-2 text-cream/80">
            <li><Link href="/account" className="hover:text-cream">Your orders</Link></li>
            <li><Link href="/login" className="hover:text-cream">Sign in</Link></li>
          </ul>
        </div>
        <div id="contact" className="scroll-mt-24">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-gold">Contact</p>
          <p className="text-cream/80">{STORE.contactEmail}</p>
          <p className="text-cream/80">{STORE.contactPhone}</p>
        </div>
      </div>
      <p aria-hidden className="text-outline select-none text-center font-display text-[20vw] font-normal leading-[0.8] tracking-[0.2em] [--outline:var(--color-gold)] xl:text-[17rem]">
        {STORE.name}
      </p>
      <div className="flex flex-col items-center justify-between gap-2 border-t border-cream/15 px-5 py-5 text-xs text-cream/60 sm:flex-row sm:px-8">
        <p>© {new Date().getFullYear()} {STORE.name}. All rights reserved.</p>
        <p>
          Designed &amp; developed by{" "}
          <a href="https://www.endermonks.com" target="_blank" rel="noopener" className="text-gold underline-offset-4 hover:underline">
            EnderMonks
          </a>
        </p>
      </div>
    </footer>
  );
}
