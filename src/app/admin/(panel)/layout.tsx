import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/server/auth/admin";
import { logout } from "@/actions/admin/auth";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-brown text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/admin" className="flex items-center gap-4">
            <Image src="/brand/logo-cream.png" alt="EVORN" width={990} height={260} className="h-8 w-auto" />
            <span className="text-[11px] uppercase tracking-[0.3em] text-tan">Admin</span>
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em]">
            <Link href="/admin" className="hover:text-tan">Orders</Link>
            <Link href="/admin/products" className="hover:text-tan">Products</Link>
            <Link href="/admin/categories" className="hover:text-tan">Categories</Link>
            <Link href="/admin/materials" className="hover:text-tan">Materials</Link>
            <Link href="/admin/reviews" className="hover:text-tan">Reviews</Link>
            <Link href="/admin/bank-accounts" className="hover:text-tan">Bank accounts</Link>
            <Link href="/admin/settings" className="hover:text-tan">Settings</Link>
            <Link href="/" className="hover:text-tan">View store</Link>
            <form action={logout}>
              <button className="uppercase tracking-[0.2em] hover:text-tan">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
