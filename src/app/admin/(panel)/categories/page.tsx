import { AddCategory, CategoryRow } from "@/components/CategoryAdmin";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <h1 className="text-5xl">Categories</h1>
      <AddCategory />
      <ul className="mt-8 divide-y divide-line border border-line">
        {categories.map((c) => (
          <CategoryRow key={c.id} id={c.id} name={c.name} slug={c.slug} productCount={c._count.products} />
        ))}
        {categories.length === 0 && <li className="p-6 text-center text-brown/70">No categories yet.</li>}
      </ul>
    </>
  );
}
