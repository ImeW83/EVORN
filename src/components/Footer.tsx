import Image from "next/image";
import Link from "next/link";
import { STORE } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-24 bg-brown text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
        <div>
          <Image src="/brand/logo-cream.png" alt="EVORN" width={990} height={260} className="h-10 w-auto" />
          <p className="mt-4 max-w-xs text-sm text-cream/75">Timeless pieces made to be worn, gifted and treasured.</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-tan">Explore</p>
          <ul className="space-y-2 text-cream/80">
            <li><Link href="/shop" className="hover:text-cream">Shop all</Link></li>
            <li><Link href="/cart" className="hover:text-cream">Your cart</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-tan">Contact</p>
          <p className="text-cream/80">{STORE.contactEmail}</p>
          <p className="text-cream/80">{STORE.contactPhone}</p>
        </div>
      </div>
      <div className="border-t border-cream/15 py-5 text-center text-xs text-cream/60">
        © {new Date().getFullYear()} {STORE.name}. All rights reserved.
      </div>
    </footer>
  );
}
