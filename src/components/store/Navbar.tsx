import Image from "next/image";
import Link from "next/link";
import { getCustomer } from "@/server/auth/customer";
import { getCategories } from "@/server/services/catalog";
import { CartLink } from "./CartLink";

export async function Navbar() {
  const categories = await getCategories();
  const user = await getCustomer();
  return (
    <header className="sticky top-0 z-40 bg-brown text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="EVORN home" className="shrink-0">
          <Image src="/brand/logo-cream.png" alt="EVORN" width={990} height={260} className="h-9 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-8 text-[12px] uppercase tracking-[0.2em] md:flex">
          <Link href="/shop" className="hover:text-tan">Shop all</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="hover:text-tan">
              {c.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-5 text-[12px] uppercase tracking-[0.2em]">
          {user ? (
            <Link href="/account" className="hover:text-tan">Account</Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-tan">Log in</Link>
              <Link href="/signup" className="hidden hover:text-tan sm:inline">Sign up</Link>
            </>
          )}
          <CartLink />
        </div>
      </div>
      <nav className="flex gap-6 overflow-x-auto border-t border-cream/15 px-5 py-3 text-[11px] uppercase tracking-[0.2em] md:hidden">
        <Link href="/shop" className="shrink-0">All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/shop?category=${c.slug}`} className="shrink-0">
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
