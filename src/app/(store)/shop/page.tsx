import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { SECTIONS, isSection, sectionOf } from "@/lib/sections";
import { SORTS, getCategories, getCategoriesInSection, getUsedMaterials, searchProducts } from "@/server/services/catalog";
import { getRatings } from "@/server/services/reviews";

export const dynamic = "force-dynamic";

type Search = { for?: string; category?: string; material?: string; min?: string; max?: string; sort?: string; q?: string };

export default async function Shop({ searchParams }: PageProps<"/shop">) {
  const sp = (await searchParams) as Search;
  const first = (v: unknown) => (typeof v === "string" ? v : undefined);
  const sectionSlug = first(sp.for);
  const section = isSection(sectionSlug) ? sectionSlug : undefined;
  const category = first(sp.category);
  const material = first(sp.material);
  const q = first(sp.q)?.trim();
  const sort = SORTS[first(sp.sort) ?? ""] ? first(sp.sort)! : "newest";
  const min = Number(first(sp.min)) || undefined;
  const max = Number(first(sp.max)) || undefined;

  const [categories, materials, products] = await Promise.all([
    section ? getCategoriesInSection(section) : getCategories(),
    getUsedMaterials(),
    searchProducts({ section, category, material, q, min, max, sort }),
  ]);

  const ratings = await getRatings(products.map((p) => p.id));
  const activeCategory = categories.find((c) => c.slug === category);
  const activeSection = sectionOf(section);
  const hasFilters = Boolean(material || q || min || max);
  // Links keep the section and category unless told otherwise.
  const href = (to: { for?: string; category?: string } = { for: section, category }) => {
    const params = new URLSearchParams();
    if (to.for) params.set("for", to.for);
    if (to.category) params.set("category", to.category);
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };
  const tab = (on: boolean) =>
    `border-b-2 pb-2 text-[12px] uppercase tracking-[0.25em] transition ${on ? "border-brown text-brown-dark" : "border-transparent text-brown/60 hover:text-brown"}`;

  const field = "w-full border border-line bg-pearl px-3 py-2.5 text-sm outline-none focus:border-brown";
  const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-tan";

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <nav aria-label="Shop sections" className="mb-8 flex gap-8 border-b border-line">
        <Link href={href({ category })} aria-current={!section ? "page" : undefined} className={tab(!section)}>All</Link>
        {SECTIONS.map((s) => (
          <Link key={s.slug} href={href({ for: s.slug })} aria-current={section === s.slug ? "page" : undefined} className={tab(section === s.slug)}>
            {s.name}
          </Link>
        ))}
      </nav>
      {activeSection && activeCategory && <p className="text-[11px] uppercase tracking-[0.25em] text-tan">{activeSection.name}</p>}
      <h1 className="text-5xl">{activeCategory?.name ?? activeSection?.title ?? "All jewellery"}</h1>
      <p className="mt-2 text-sm text-brown/70">
        {products.length} {products.length === 1 ? "piece" : "pieces"}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {[{ name: "All", slug: undefined as string | undefined }, ...categories].map((c) => (
          <Link
            key={c.name}
            href={href({ for: section, category: c.slug })}
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
        <div className="self-start">
        {/* On phones the filters fold behind a toggle so products show first (CSS only: checkbox + peer). */}
        <input type="checkbox" id="filters-toggle" className="peer sr-only" />
        <label
          htmlFor="filters-toggle"
          className="flex cursor-pointer items-center justify-between border border-line px-5 py-3 text-[11px] uppercase tracking-[0.2em] peer-focus-visible:outline-2 peer-focus-visible:outline-brown lg:hidden"
        >
          Filter &amp; sort{hasFilters && " (on)"}
          <span aria-hidden>▾</span>
        </label>
        <form action="/shop" className="mt-3 hidden space-y-6 border border-line p-5 peer-checked:block lg:mt-0 lg:block">
          {section && <input type="hidden" name="for" value={section} />}
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
              <Link href={href()} className="border border-line px-4 py-3 text-[11px] uppercase tracking-[0.2em] hover:border-brown">
                Reset
              </Link>
            )}
          </div>
        </form>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-display text-3xl">No pieces match your filters</p>
            <Link href={href()} className="mt-4 inline-block text-sm underline underline-offset-4">
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
