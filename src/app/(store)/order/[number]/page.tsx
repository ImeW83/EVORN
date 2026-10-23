import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderConfirmation({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const order = await db.order.findUnique({ where: { number }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-tan">Thank you, {order.name.split(" ")[0]}</p>
      <h1 className="mt-3 text-5xl">Your order is placed</h1>
      <p className="mt-3 text-brown/80">
        Order number <strong>{order.number}</strong>. We will contact you on {order.phone} to confirm delivery.
      </p>

      <div className="mt-10 border border-line bg-sand/60 p-6 text-left text-sm">
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-3">
              <span>{i.name} <span className="text-brown/60">× {i.quantity}</span></span>
              <span>{money(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</dd></div>
          <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
        <p className="mt-4 text-brown/70">Delivering to {order.address}, {order.city}. Payment on delivery.</p>
      </div>

      <Link href="/shop" className="mt-10 inline-block bg-brown px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
        Continue shopping
      </Link>
    </div>
  );
}
