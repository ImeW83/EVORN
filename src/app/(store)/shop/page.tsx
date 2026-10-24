import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { SORTS, getCategories, getUsedMaterials, searchProducts } from "@/server/services/catalog";
import { getRatings } from "@/server/services/reviews";

export const dynamic = "force-dynamic";

type Search = { category?: string; material?: string; min?: string; max?: string; sort?: string; q?: string };

export default async function Shop({ searchParams }: PageProps<"/shop">) {
  const sp = (await searchParams) as Search;
  const first = (v: unknown) => (typeof v === "string" ? v : undefined);
  const category = first(sp.category);
  const material = first(sp.material);
  const q = first(sp.q)?.trim();
  const sort = SORTS[first(sp.sort) ?? ""] ? first(sp.sort)! : "newest";
  const min = Number(first(sp.min)) || undefined;
  const max = Number(first(sp.max)) || undefined;

  const [categories, materials, products] = await Promise.all([
    getCategories(),
    getUsedMaterials(),
    searchProducts({ category, material, q, min, max, sort }),
  ]);

  const ratings = await getRatings(products.map((p) => p.id));
  const activeCategory = categories.find((c) => c.slug === category);
  const hasFilters = Boolean(material || q || min || max);
  const href = (slug?: string) => (slug ? `/shop?category=${slug}` : "/shop");

  const field = "w-full border border-line bg-cream px-3 py-2.5 text-sm outline-none focus:border-brown";
  const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-tan";

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-5xl">{activeCategory?.name ?? "All jewellery"}</h1>
      <p className="mt-2 text-sm text-brown/70">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[{ name: "All", slug: undefined as string | undefined }, ...categories].map((c) => (
          <Link
            key={c.name}
            href={href(c.slug)}
            className={`border px-5 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
              category === c.slug || (!category && !c.slug)
                ? "border-brown bg-brown text-cream"
                : "border-line hover:border-brown"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <form action="/shop" className="space-y-6 self-start border border-line p-5">
          {category && <input type="hidden" name="category" value={category} />}
          <div>
            <label htmlFor="q" className={label}>Search</label>
            <input id="q" name="q" defaultValue={q} placeholder="e.g. pearl" className={field} />
          </div>
          <div>
            <label htmlFor="material" className={label}>Material</label>
            <select id="material" name="material" defaultValue={material ?? ""} className={field}>
              <option value="">All materials</option>
              {materials.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Price (LKR)</span>
            <div className="flex items-center gap-2">
              <input name="min" type="number" min={0} defaultValue={min} placeholder="Min" aria-label="Minimum price" className={field} />
              <span className="text-tan">–</span>
              <input name="max" type="number" min={0} defaultValue={max} placeholder="Max" aria-label="Maximum price" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="sort" className={label}>Sort by</label>
            <select id="sort" name="sort" defaultValue={sort} className={field}>
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-brown py-3 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
              Apply
            </button>
            {(hasFilters || sort !== "newest") && (
              <Link href={href(category)} className="border border-line px-4 py-3 text-[11px] uppercase tracking-[0.2em] hover:border-brown">
                Reset
              </Link>
            )}
          </div>
        </form>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl">No pieces match your filters</p>
            <Link href={href(category)} className="mt-4 inline-block text-sm underline underline-offset-4">
              Clear filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
