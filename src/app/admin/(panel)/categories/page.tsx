import { AddCategory, CategoryRow } from "@/components/admin/CategoryAdmin";
import { requireAdmin } from "@/server/auth/admin";
import { getCategoriesWithCounts } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function AdminCategories() {
  await requireAdmin();
  const categories = await getCategoriesWithCounts();
  return (
    <>
      <h1 className="text-5xl">Categories</h1>
      <AddCategory />
      <ul className="mt-8 divide-y divide-line border border-line">
        {categories.map((c) => (
          <CategoryRow key={c.id} id={c.id} name={c.name} slug={c.slug} productCount={c.productCount} />
        ))}
        {categories.length === 0 && <li className="p-6 text-center text-brown/70">No categories yet.</li>}
      </ul>
    </>
  );
}
