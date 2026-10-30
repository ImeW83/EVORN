import Link from "next/link";
import { priceRange, type OptionGroup } from "@/lib/options";
import type { RatingSummary } from "@/server/types";
import { Price } from "../ui/Price";
import { Stars } from "../ui/Stars";
import { AddToCart } from "./AddToCart";
import { ProductImage } from "./ProductImage";

type P = {
  id: string; slug: string; name: string; price: number; originalPrice: number | null; image: string | null; material: string; inStock: boolean;
  options?: OptionGroup[];
};

export function ProductCard({ product, rating }: { product: P; rating?: RatingSummary }) {
  const options = product.options ?? [];
  const { min, max } = priceRange(product.price, options);
  const fromExtra = min - product.price;
  return (
    <div className="group flex flex-col">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="aspect-[4/5] transition duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-tan">{product.material}</p>
        <Link href={`/product/${product.slug}`} className="font-display mt-1 text-xl leading-tight hover:text-brown">
          {product.name}
        </Link>
        <Price
          price={min}
          originalPrice={product.originalPrice != null ? product.originalPrice + fromExtra : null}
          upTo={max - min}
          className="mt-1 text-sm text-brown"
        />
        {rating && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-brown/70">
            <Stars value={rating.average} className="text-sm" />
            <span>({rating.count})</span>
          </p>
        )}
        <div className="mt-4">
          {options.length > 0 && product.inStock ? (
            // A size or colour must be chosen first, which happens on the product page.
            <Link
              href={`/product/${product.slug}`}
              className="block w-full border border-brown py-2.5 text-center text-[11px] uppercase tracking-[0.18em] text-brown transition hover:bg-brown hover:text-cream"
            >
              Choose options
            </Link>
          ) : (
            <AddToCart product={product} disabled={!product.inStock} compact />
          )}
        </div>
      </div>
    </div>
  );
}
