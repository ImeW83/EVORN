import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/store/AddToCart";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ReviewsSection } from "@/components/store/ReviewsSection";
import { Stars } from "@/components/ui/Stars";
import { money } from "@/lib/format";
import { getProductBySlug, getRelatedProducts } from "@/server/services/catalog";
import { getRatings } from "@/server/services/reviews";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.categoryId, product.id);
  const ratings = await getRatings([product.id, ...related.map((p) => p.id)]);
  const rating = ratings[product.id];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <nav className="text-xs uppercase tracking-[0.2em] text-brown/60">
        <Link href="/shop" className="hover:text-brown">Shop</Link> /{" "}
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-brown">{product.category.name}</Link>
      </nav>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <div className="self-center">
          <p className="text-[11px] uppercase tracking-[0.25em] text-tan">{product.material}</p>
          <h1 className="mt-2 text-5xl leading-tight">{product.name}</h1>
          {rating && (
            <a href="#reviews-heading" className="mt-3 flex items-center gap-2 text-sm text-brown/80 hover:text-brown">
              <Stars value={rating.average} className="text-lg" />
              <span>{rating.average.toFixed(1)} ({rating.count})</span>
            </a>
          )}
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
              <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
            ))}
          </div>
        </section>
      )}

      <ReviewsSection productId={product.id} slug={product.slug} />
    </div>
  );
}
