"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OrderSummary } from "@/components/OrderSummary";
import { cart, useCart } from "@/lib/cart";
import { money } from "@/lib/format";
import { placeOrder } from "./actions";

const field = "w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

type Prefill = { name: string; phone: string; email: string; address: string; city: string };

export function CheckoutForm({ prefill, loggedIn }: { prefill: Prefill; loggedIn: boolean }) {
  const { lines, subtotal } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const get = (k: string) => String(f.get(k) ?? "");
    const result = await placeOrder({
      items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
      name: get("name"),
      phone: get("phone"),
      email: get("email"),
      address: get("address"),
      city: get("city"),
      notes: get("notes"),
    });
    if (result.ok) {
      router.push(`/order/${result.number}`);
      cart.clear();
    } else {
      setError(result.error);
      setBusy(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-28 text-center">
        <h1 className="text-5xl">Nothing to check out</h1>
        <Link href="/shop" className="mt-8 inline-block bg-brown px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
          Browse jewellery
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <h1 className="text-5xl">Checkout</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="space-y-5">
          <h2 className="text-3xl">Delivery details</h2>
          {!loggedIn && (
            <p className="text-sm text-brown/80">
              Have an account?{" "}
              <Link href="/login?next=/checkout" className="underline">Log in</Link> or{" "}
              <Link href="/signup?next=/checkout" className="underline">sign up</Link> to save your details and track orders.
              Or just continue as a guest.
            </p>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={label}>Full name *</label>
              <input id="name" name="name" required autoComplete="name" defaultValue={prefill.name} className={field} />
            </div>
            <div>
              <label htmlFor="phone" className={label}>Phone *</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" defaultValue={prefill.phone} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="email" className={label}>Email (optional)</label>
            <input id="email" name="email" type="email" autoComplete="email" defaultValue={prefill.email} className={field} />
          </div>
          <div>
            <label htmlFor="address" className={label}>Delivery address *</label>
            <input id="address" name="address" required autoComplete="street-address" defaultValue={prefill.address} className={field} />
          </div>
          <div>
            <label htmlFor="city" className={label}>City *</label>
            <input id="city" name="city" required autoComplete="address-level2" defaultValue={prefill.city} className={field} />
          </div>
          <div>
            <label htmlFor="notes" className={label}>Order notes (optional)</label>
            <textarea id="notes" name="notes" rows={3} className={field} />
          </div>

          <div className="border border-line bg-sand/60 p-4 text-sm">
            <p className="font-medium">Payment: Cash on delivery</p>
            <p className="text-brown/70">Pay when your order arrives.</p>
          </div>

          {error && <p role="alert" className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <button
            disabled={busy}
            className="w-full bg-brown py-4 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60"
          >
            {busy ? "Placing order…" : "Place order"}
          </button>
        </form>

        <OrderSummary subtotal={subtotal}>
          <ul className="mt-5 divide-y divide-line text-sm">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-4 py-3">
                <span>
                  {l.name} <span className="text-brown/60">× {l.quantity}</span>
                </span>
                <span>{money(l.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
        </OrderSummary>
      </div>
    </div>
  );
}
