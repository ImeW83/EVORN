"use client";

import { useState, type ReactNode } from "react";
import type { OptionGroup } from "@/lib/options";
import type { ProductImage } from "@/server/types";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";

type Props = {
  product: {
    id: string; slug: string; name: string; price: number; originalPrice: number | null; image: string | null;
    inStock: boolean; options: OptionGroup[]; images: ProductImage[];
  };
  header: ReactNode; // material, name and rating, above the price
  children?: ReactNode; // description and details, between the price and the options
};

// The product page's gallery and buying column. Shares which photo is showing, so picking a choice with a linked
// photo (e.g. "Silver") turns the gallery to it.
export function ProductShowcase({ product, header, children }: Props) {
  const [active, setActive] = useState(0);

  function showPhoto(publicId: string) {
    const i = product.images.findIndex((img) => img.publicId === publicId);
    if (i >= 0) setActive(i);
  }

  return (
    <div className="mt-8 grid gap-12 md:grid-cols-2">
      <ProductGallery images={product.images} name={product.name} active={active} onActive={setActive} />
      <div className="self-center">
        {header}
        <ProductPurchase product={product} onPhoto={showPhoto}>
          {children}
        </ProductPurchase>
      </div>
    </div>
  );
}
