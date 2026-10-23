import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
  await requireAdmin();
  const products = await db.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-5xl">Products</h1>
        <Link href="/admin/products/new" className="bg-brown px-6 py-3 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
          Add product
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-sand text-[11px] uppercase tracking-[0.15em] text-brown/80">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-sand/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="font-medium text-brown underline underline-offset-4">{p.name}</Link>
                  {p.featured && <span className="ml-2 text-[10px] uppercase tracking-[0.15em] text-tan">Featured</span>}
                </td>
                <td className="px-4 py-3">{p.category.name}</td>
                <td className="px-4 py-3">{money(p.price)}</td>
                <td className="px-4 py-3">{p.inStock ? "In stock" : <span className="text-red-700">Sold out</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
