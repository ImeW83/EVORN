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
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="EVORN home" className="shrink-0">
          <Image src="/brand/logo-cream.png" alt="EVORN" width={990} height={260} className="h-9 w-auto" priority />
        </Link>
        <nav className="hidden items-center gap-8 text-[12px] md:flex">
          {links}
        </nav>
        <div className="flex items-center gap-5 text-[12px] uppercase tracking-[0.2em]">
          <SearchBox />
          {user ? (
            <Link href="/account" className="hover:text-tan">Account</Link>
          ) : (
            <Link href="/login" className="hover:text-tan">Sign in</Link>
          )}
          <CartLink />
        </div>
      </div>
      <nav className="flex items-center justify-center gap-8 border-t border-cream/15 px-5 py-3 text-[11px] md:hidden">
        {links}
      </nav>
    </header>
  );
}
