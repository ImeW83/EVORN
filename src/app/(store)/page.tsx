import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { STORE } from "@/lib/config";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/server/services/catalog";
import { getRatings } from "@/server/services/reviews";

export const dynamic = "force-dynamic";

// The gold ring with a diamond on top; on phones it sits under the headline instead of beside it.
function HeroRing({ className, children }: { className: string; children?: React.ReactNode }) {
  return (
    <div className={className}>
      <svg aria-hidden viewBox="0 0 440 440" className="absolute inset-0 h-full w-full text-gold" fill="none" stroke="currentColor">
        <circle cx="220" cy="245" r="185" strokeWidth="1.5" />
        <circle cx="220" cy="245" r="172" strokeWidth="0.75" />
        <circle className="orbit" cx="220" cy="245" r="195" strokeWidth="1.5" strokeDasharray="1 9" strokeLinecap="round" />
        <path d="M220 60 192 26l12-16h32l12 16-28 34Z" strokeWidth="1.5" />
        <path d="M192 26h56M204 10l16 16 16-16M220 26v34" strokeWidth="0.75" />
      </svg>
      <span aria-hidden className="absolute left-[15.9%] top-[21.6%] h-[68.2%] w-[68.2%] rounded-full bg-brown-dark" />
      {children}
    </div>
  );
}

// Round gold "Shop now" link with the tagline turning around its edge.
function ShopBadge({ id, className }: { id: string; className: string }) {
  return (
    <Link href="/shop" aria-label="Shop now" className={`rounded-full bg-gold text-brown-dark ${className}`}>
      <svg aria-hidden viewBox="0 0 150 150" className="spin-slow absolute inset-0 h-full w-full">
        <defs>
          <path id={id} d="M75 75m-56 0a56 56 0 1 1 112 0a56 56 0 1 1-112 0" />
        </defs>
        <text fontSize="11" fill="currentColor" textLength="346" lengthAdjust="spacing">
          <textPath href={`#${id}`}>SHOP NOW ✦ {STORE.tagline.toUpperCase()} ✦</textPath>
        </text>
      </svg>
      <svg aria-hidden viewBox="0 0 150 150" className="absolute inset-0 h-full w-full" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M62 88 88 62M70 62h18v18" />
      </svg>
    </Link>
  );
}

export default async function Home() {
  const [categories, featured] = await Promise.all([getCategoriesWithCounts(), getFeaturedProducts(8)]);
  const ratings = await getRatings(featured.map((p) => p.id));

  return (
    <>
      <section className="relative overflow-hidden bg-brown text-cream">
        <p aria-hidden className="text-outline pointer-events-none absolute -left-8 top-6 select-none font-display text-[42vw] leading-none tracking-[0.05em] [--outline:color-mix(in_srgb,var(--color-cream)_20%,transparent)] lg:text-[26rem]">
          {STORE.name}
        </p>

        <div className="relative mx-auto max-w-7xl px-5 py-16 md:py-24">
          <HeroRing className="absolute right-5 top-1/2 hidden h-[440px] w-[440px] -translate-y-1/2 lg:block" />

          <div className="relative max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold">✦ New season · {STORE.name}</p>
            <p className="font-display mt-5 text-5xl font-light italic leading-[0.95] text-gold md:text-7xl lg:text-8xl">Your Everyday</p>
            <h1 className="mt-1 whitespace-nowrap text-[12.5vw] font-normal leading-[0.9] tracking-[0.06em] lg:text-[8.5rem] xl:text-[9.5rem]">
              ACCESS<span className="text-outline">ORIES</span>
            </h1>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/shop"
                className="bg-cream px-10 py-5 text-xs uppercase tracking-[0.28em] text-brown-dark transition hover:bg-gold"
              >
                Shop the collection
              </Link>
              <Link href="/shop?sort=newest" className="border-b border-gold pb-1 text-xs uppercase tracking-[0.25em] text-gold hover:text-cream">
                New arrivals →
              </Link>
              <ShopBadge id="badge-path-wide" className="relative ml-4 hidden h-32 w-32 shrink-0 lg:block" />
            </div>
          </div>
          <HeroRing className="relative mx-auto mt-12 h-64 w-64 sm:h-80 sm:w-80 lg:hidden">
            <ShopBadge id="badge-path-narrow" className="absolute left-1/2 top-[55.7%] h-28 w-28 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32" />
          </HeroRing>
        </div>

        {categories.length > 0 && (
          <div className="relative overflow-hidden bg-gold py-3 text-brown-dark">
            <div className="marquee flex w-max">
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
                  {[...categories, ...categories].map((c, i) => (
                    <li key={`${c.id}-${i}`} className="flex items-center">
                      <Link
                        href={`/shop?category=${c.slug}`}
                        tabIndex={copy === 1 ? -1 : undefined}
                        className={`font-display px-8 text-2xl hover:text-brown ${i % 2 ? "italic" : ""}`}
                      >
                        {c.name}
                      </Link>
                      <span aria-hidden className="text-sm">✦</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-20">
        <h2 className="text-center text-4xl">Shop by category</h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden border border-line bg-sand text-center transition hover:text-cream"
            >
              {c.image && (
                <Image
                  src={c.image.url}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 20vw, 50vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              )}
              <span aria-hidden className={`absolute inset-0 transition ${c.image ? "bg-brown-dark/80 group-hover:bg-brown-dark/88" : "group-hover:bg-brown"}`} />
              <span className={`font-display relative text-2xl ${c.image ? "text-cream" : ""}`}>{c.name}</span>
              <span className="relative mt-1 text-[11px] uppercase tracking-[0.2em] text-tan">{c.productCount} {c.productCount === 1 ? "piece" : "pieces"}</span>
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
            <ProductCard key={p.id} product={p} rating={ratings[p.id]} />
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
