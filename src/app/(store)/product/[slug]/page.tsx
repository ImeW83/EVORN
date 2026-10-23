import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product) notFound();

  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, NOT: { id: product.id } },
    take: 4,
  });

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <nav className="text-xs uppercase tracking-[0.2em] text-brown/60">
        <Link href="/shop" className="hover:text-brown">Shop</Link> /{" "}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brown">{product.category.name}</Link>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <ProductImage src={product.image} alt={product.name} className="aspect-[4/5]" />
        <div className="self-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-tan">{product.material}</p>
          <h1 className="mt-2 text-5xl leading-tight">{product.name}</h1>
          <p className="mt-4 text-2xl text-brown">{money(product.price)}</p>
          <p className="mt-6 max-w-md leading-relaxed text-brown-dark/80">{product.description}</p>

          <dl className="mt-8 max-w-md divide-y divide-line border-y border-line text-sm">
            <div className="flex justify-between py-3"><dt className="text-brown/70">Category</dt><dd>{product.category.name}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-brown/70">Material</dt><dd>{product.material}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-brown/70">Availability</dt><dd>{product.inStock ? "In stock" : "Sold out"}</dd></div>
          </dl>

          <div className="mt-8">
            <AddToCart product={product} disabled={!product.inStock} />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-4xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
