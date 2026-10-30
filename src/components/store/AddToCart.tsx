"use client";

import { useState } from "react";
import { cart } from "@/lib/cart";
import type { SelectedOption } from "@/lib/options";

type Props = {
  product: { id: string; slug: string; name: string; price: number; image: string | null };
  options?: SelectedOption[]; // the customer's choices, when the product has options
  canAdd?: () => boolean; // runs first; return false to stop (e.g. a size isn't chosen yet)
  disabled?: boolean;
  compact?: boolean;
};

export function AddToCart({ product, options = [], canAdd, disabled, compact }: Props) {
  const [added, setAdded] = useState(false);

  function add() {
    if (canAdd && !canAdd()) return;
    cart.add({ productId: product.id, slug: product.slug, name: product.name, price: product.price, options, image: product.image });
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
