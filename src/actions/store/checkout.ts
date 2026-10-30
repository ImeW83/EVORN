"use server";

import { after } from "next/server";
import { PAYMENT_METHODS, calcDelivery, type PaymentMethod } from "@/lib/config";
import { selectionExtra, type OptionGroup, type SelectedOption } from "@/lib/options";
import { PHONE_ERROR, normalizePhone } from "@/lib/phone";
import { getCustomer } from "@/server/auth/customer";
import { connectDb } from "@/server/db";
import { BankAccountModel, OrderModel, ProductModel, isId } from "@/server/models";
import { notifyAdminNewOrder } from "@/server/services/notifications";
import { newOrderNumber } from "@/server/services/orders";
import { getDeliverySettings } from "@/server/services/settings";

export type CheckoutInput = {
  items: { productId: string; options?: SelectedOption[]; quantity: number }[];
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: PaymentMethod;
};

export type CheckoutResult = { ok: true; number: string } | { ok: false; error: string };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const name = input.name?.trim();
  const rawPhone = input.phone?.trim();
  const address = input.address?.trim();
  const city = input.city?.trim();
  const email = input.email?.trim();

  if (!name || !rawPhone || !email || !address || !city) return { ok: false, error: "Please fill in all required fields." };
  const phone = normalizePhone(rawPhone);
  if (!phone) return { ok: false, error: PHONE_ERROR };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Please enter a valid email address." };
  if (!Array.isArray(input.items) || input.items.length === 0) return { ok: false, error: "Your cart is empty." };
  if (!(PAYMENT_METHODS as readonly string[]).includes(input.paymentMethod)) return { ok: false, error: "Choose a payment method." };

  await connectDb();

  if (input.paymentMethod === "BANK_TRANSFER" && !(await BankAccountModel.exists({ active: true }))) {
    return { ok: false, error: "Bank transfer is not available right now. Please choose cash on delivery." };
  }

  // Never trust prices from the browser: load them from the database.
  const ids = input.items.map((i) => i.productId).filter(isId);
  const products = await ProductModel.find({ _id: { $in: ids } }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const lines: { productId: unknown; name: string; price: number; options: SelectedOption[]; quantity: number }[] = [];
  for (const item of input.items) {
    const product = byId.get(String(item.productId));
    const quantity = Math.floor(Number(item.quantity));
    if (!product || quantity < 1 || quantity > 20) return { ok: false, error: "An item in your cart is no longer available." };
    if (!product.inStock) return { ok: false, error: `${product.name} is sold out. Please remove it from your cart.` };
    const groups = (product.options ?? []) as OptionGroup[];
    const options = (Array.isArray(item.options) ? item.options : []).map((o) => ({ name: String(o?.name), value: String(o?.value) }));
    const extra = selectionExtra(groups, options);
    if (extra === null) {
      return { ok: false, error: `The options chosen for ${product.name} are no longer available. Please remove it and add it again.` };
    }
    // Store the options in the product's own order (e.g. Color before Size).
    const ordered = groups.map((g) => options.find((o) => o.name === g.name)!);
    lines.push({ productId: product._id, name: product.name, price: product.price + extra, options: ordered, quantity });
  }

  const subtotal = lines.reduce((n, l) => n + l.price * l.quantity, 0);
  const deliveryFee = calcDelivery(subtotal, await getDeliverySettings());
  const number = newOrderNumber();
  const bank = input.paymentMethod === "BANK_TRANSFER";

  const total = subtotal + deliveryFee;

  await OrderModel.create({
    number,
    userId: (await getCustomer())?.id ?? null,
    name,
    phone,
    email,
    address,
    city,
    notes: input.notes?.trim() || null,
    paymentMethod: input.paymentMethod,
    paymentStatus: bank ? "AWAITING_RECEIPT" : "NONE",
    items: lines,
    subtotal,
    deliveryFee,
    total,
  });

  // Notify the admin after the response is sent, so checkout never waits on email or SMS.
  after(() =>
    notifyAdminNewOrder({
      number,
      name,
      phone,
      email,
      address,
      city,
      paymentMethod: input.paymentMethod,
      total,
      items: lines,
    }),
  );

  return { ok: true, number };
}
