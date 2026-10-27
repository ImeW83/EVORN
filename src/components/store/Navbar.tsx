import Image from "next/image";
import Link from "next/link";
import { getCustomer } from "@/server/auth/customer";
import { getCategories } from "@/server/services/catalog";
import { CartLink } from "./CartLink";
import { SearchBox } from "./SearchBox";
import { ShopMenu } from "./ShopMenu";

export async function Navbar() {
  const categories = await getCategories();
  const user = await getCustomer();
  const links = (
    <>
      <Link href="/" className="uppercase tracking-[0.2em] hover:text-tan">Home</Link>
      <ShopMenu categories={categories} />
      <Link href="/#contact" className="uppercase tracking-[0.2em] hover:text-tan">Contact us</Link>
    </>
  );
  return (
    <header className="sticky top-0 z-40 bg-brown text-cream">
      {/* Links on the left, logo in the centre, search/account/cart on the right. On phones the links move to a
          second row and search takes the left slot, so the logo stays centred. */}
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-4">
        <div className="flex items-center">
          <nav className="hidden items-center gap-8 text-[12px] md:flex">{links}</nav>
          <div className="flex md:hidden">
            <SearchBox />
          </div>
        </div>
        <Link href="/" aria-label="EVORN home" className="shrink-0">
          <Image src="/brand/logo-cream.png" alt="EVORN" width={990} height={260} className="h-9 w-auto" priority />
        </Link>
        <div className="flex items-center justify-end gap-5 text-[12px] uppercase tracking-[0.2em]">
          <div className="hidden md:flex">
            <SearchBox />
          </div>
          <Link href={user ? "/account" : "/login"} aria-label={user ? "Account" : "Sign in"} className="flex items-center hover:text-tan">
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:hidden" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </svg>
            <span className="hidden sm:inline">{user ? "Account" : "Sign in"}</span>
          </Link>
          <CartLink />
        </div>
      </div>
      <nav className="flex items-center justify-center gap-8 border-t border-cream/15 px-5 py-3 text-[11px] md:hidden">
        {links}
      </nav>
    </header>
  );
}
