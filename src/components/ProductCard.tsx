import Link from "next/link";
import { money } from "@/lib/format";
import { AddToCart } from "./AddToCart";
import { ProductImage } from "./ProductImage";

type P = { id: number; slug: string; name: string; price: number; image: string | null; material: string; inStock: boolean };

export function ProductCard({ product }: { product: P }) {
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
        <p className="mt-1 text-sm text-brown">{money(product.price)}</p>
        <div className="mt-4">
          <AddToCart product={product} disabled={!product.inStock} compact />
        </div>
      </div>
    </div>
  );
}
