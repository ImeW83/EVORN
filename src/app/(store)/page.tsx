import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/server/services/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategoriesWithCounts(), getFeaturedProducts(8)]);

  return (
    <>
      <section className="bg-brown text-cream">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-24 text-center md:py-36">
          <p className="text-[11px] uppercase tracking-[0.35em] text-tan">Fine jewellery</p>
          <Image
            src="/brand/logo-cream.png"
            alt="EVORN"
            width={990}
            height={260}
            className="mt-8 h-auto w-[78%] max-w-xl"
            priority
          />
          <p className="font-display mt-8 max-w-md text-2xl italic text-cream/85">
            Timeless pieces, made to be worn and treasured.
          </p>
          <Link
            href="/shop"
            className="mt-10 border border-cream px-10 py-4 text-xs uppercase tracking-[0.25em] transition hover:bg-cream hover:text-brown"
          >
            Shop the collection
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-20">
        <h2 className="text-center text-4xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group flex aspect-square flex-col items-center justify-center border border-line bg-sand text-center transition hover:bg-brown hover:text-cream"
            >
              <span className="font-display text-2xl">{c.name}</span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.2em] text-tan">{c.productCount} pieces</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-24">
        <div className="flex items-end justify-between">
          <h2 className="text-4xl">Featured pieces</h2>
          <Link href="/shop" className="text-xs uppercase tracking-[0.2em] text-brown underline underline-offset-4">
            View all
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 grid max-w-7xl gap-8 px-5 text-center md:grid-cols-3">
        {[
          ["Delivered to your door", "Careful, insured delivery island-wide."],
          ["Quality you can trust", "Every piece is checked by hand before it ships."],
          ["Made as gifts", "Thoughtful packaging on every order."],
        ].map(([title, text]) => (
          <div key={title} className="border-t border-line pt-6">
            <h3 className="text-2xl">{title}</h3>
            <p className="mt-2 text-sm text-brown/80">{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
