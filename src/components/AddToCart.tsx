"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";

type Props = {
  product: { id: number; slug: string; name: string; price: number; image: string | null };
  disabled?: boolean;
  compact?: boolean;
};

export function AddToCart({ product, disabled, compact }: Props) {
  const [added, setAdded] = useState(false);

  function add() {
    cart.add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={disabled}
      className={`bg-brown text-cream uppercase tracking-[0.18em] transition hover:bg-brown-dark disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "w-full py-2.5 text-[11px]" : "px-10 py-4 text-xs"
      }`}
    >
      {disabled ? "Sold out" : added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
