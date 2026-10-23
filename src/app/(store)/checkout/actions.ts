"use server";

import { randomBytes } from "node:crypto";
import { calcDelivery } from "@/lib/config";
import { getDeliverySettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer";
import { db } from "@/lib/db";

export type CheckoutInput = {
  items: { productId: number; quantity: number }[];
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
};

export type CheckoutResult = { ok: true; number: string } | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = input.name?.trim();
  const phone = input.phone?.trim();
  const address = input.address?.trim();
  const city = input.city?.trim();
  const email = input.email?.trim();

  if (!name || !phone || !address || !city) return { ok: false, error: "Please fill in all required fields." };
  if (!/^[+\d][\d\s-]{6,}$/.test(phone)) return { ok: false, error: "Please enter a valid phone number." };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: "Your cart is empty." };

  // Never trust prices from the browser: load them from the database.
  const ids = input.items.map((i) => Number(i.productId));
  const products = await db.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: { productId: number; name: string; price: number; quantity: number }[] = [];
  for (const item of input.items) {
    const product = byId.get(Number(item.productId));
    const quantity = Math.floor(Number(item.quantity));
    if (!product || quantity < 1 || quantity > 20) return { ok: false, error: "An item in your cart is no longer available." };
    if (!product.inStock) return { ok: false, error: `${product.name} is sold out. Please remove it from your cart.` };
    lines.push({ productId: product.id, name: product.name, price: product.price, quantity });
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const deliveryFee = calcDelivery(subtotal, await getDeliverySettings());
  const number = `EV-${Date.now().toString(36).toUpperCase()}${randomBytes(2).toString("hex").toUpperCase()}`;

  await db.order.create({
    data: {
      number,
      userId: (await getCustomer())?.id ?? null,
      name,
      phone,
      email: email || null,
      address,
      city,
      notes: input.notes?.trim() || null,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      items: { create: lines },
    },
  });

  return { ok: true, number };
}
