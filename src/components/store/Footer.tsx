import Link from "next/link";
import { STORE } from "@/lib/config";

const SOCIALS = [
  {
    name: "Instagram",
    href: STORE.socials.instagram,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: STORE.socials.facebook,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.6 1.6-1.6h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5V14h2.7v8h3.3Z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: STORE.socials.tiktok,
    icon: (
      <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z" />
      </svg>
    ),
  },
];

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
          <ul className="space-y-2 text-cream/80">
            <li><a href={`mailto:${STORE.contactEmail}`} className="hover:text-cream">{STORE.contactEmail}</a></li>
            <li><a href={`tel:${STORE.contactPhone.replace(/\s/g, "")}`} className="hover:text-cream">{STORE.contactPhone}</a></li>
          </ul>
          <ul className="mt-4 flex gap-3">
            {SOCIALS.map(({ name, href, icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${STORE.name} on ${name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 text-cream/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {icon}
                </a>
              </li>
            ))}
          </ul>
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
