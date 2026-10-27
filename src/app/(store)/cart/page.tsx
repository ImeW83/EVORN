"use client";

import Link from "next/link";
import { PageBackdrop } from "@/components/store/PageBackdrop";
import { OrderSummary } from "@/components/store/OrderSummary";
import { ProductImage } from "@/components/store/ProductImage";
import { cart, useCart } from "@/lib/cart";
import { money } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal } = useCart();

  if (lines.length === 0) {
    return (
      <div className="relative overflow-hidden">
        <PageBackdrop />
      <div className="relative mx-auto max-w-7xl px-5 py-28 text-center">
        <h1 className="text-5xl">Your cart is empty</h1>
        <p className="mt-3 text-brown/70">Discover something you will love.</p>
        <Link href="/shop" className="mt-8 inline-block bg-brown px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
          Continue shopping
        </Link>
      </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <PageBackdrop />
    <div className="relative mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-5xl">Your cart</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-line border-y border-line">
          {lines.map((l) => (
            <li key={l.productId} className="flex gap-5 py-6">
              <Link href={`/product/${l.slug}`} className="w-24 shrink-0 sm:w-28">
                <ProductImage src={l.image} alt={l.name} className="aspect-[4/5]" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/product/${l.slug}`} className="font-display text-2xl hover:text-brown">{l.name}</Link>
                    <p className="text-sm text-brown/70">{money(l.price)}</p>
                  </div>
                  <p className="font-medium">{money(l.price * l.quantity)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-line">
                    <button aria-label="Decrease quantity" onClick={() => cart.setQuantity(l.productId, l.quantity - 1)} className="h-9 w-9 hover:bg-sand">−</button>
                    <span className="w-9 text-center text-sm">{l.quantity}</span>
                    <button aria-label="Increase quantity" onClick={() => cart.setQuantity(l.productId, l.quantity + 1)} className="h-9 w-9 hover:bg-sand">+</button>
                  </div>
                  <button onClick={() => cart.remove(l.productId)} className="text-xs uppercase tracking-[0.2em] text-brown/70 underline underline-offset-4 hover:text-brown">
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <OrderSummary subtotal={subtotal}>
          <Link href="/checkout" className="mt-6 block bg-brown py-4 text-center text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark">
            Checkout
          </Link>
          <Link href="/shop" className="mt-3 block text-center text-xs uppercase tracking-[0.2em] text-brown/70 underline underline-offset-4">
            Continue shopping
          </Link>
        </OrderSummary>
      </div>
    </div>
    </div>
  );
}
