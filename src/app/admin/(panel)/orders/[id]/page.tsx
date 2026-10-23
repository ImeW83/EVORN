import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";
import { dateTime, money } from "@/lib/format";
import { updateOrderStatus } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function OrderDetails({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) notFound();

  const box = "border border-line p-6";
  const h = "mb-4 text-[11px] uppercase tracking-[0.2em] text-tan";

  return (
    <>
      <Link href="/admin" className="text-xs uppercase tracking-[0.2em] text-brown/70 hover:text-brown">← All orders</Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl">{order.number}</h1>
          <p className="mt-1 text-sm text-brown/70">Placed {dateTime(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className={box}>
          <h2 className={h}>Items</h2>
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.15em] text-brown/70">
              <tr>
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 text-right font-medium">Price</th>
                <th className="pb-3 text-right font-medium">Qty</th>
                <th className="pb-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td className="py-3">{i.name}</td>
                  <td className="py-3 text-right">{money(i.price)}</td>
                  <td className="py-3 text-right">{i.quantity}</td>
                  <td className="py-3 text-right">{money(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-4 ml-auto max-w-xs space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : money(order.deliveryFee)}</dd></div>
            <div className="flex justify-between text-lg font-medium"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className={box}>
            <h2 className={h}>Customer</h2>
            <p className="font-medium">{order.name}</p>
            <p className="text-sm">{order.phone}</p>
            {order.email && <p className="text-sm">{order.email}</p>}
          </section>

          <section className={box}>
            <h2 className={h}>Delivery address</h2>
            <p className="text-sm">{order.address}</p>
            <p className="text-sm">{order.city}</p>
            {order.notes && (
              <>
                <h2 className={`${h} mt-5`}>Notes</h2>
                <p className="text-sm">{order.notes}</p>
              </>
            )}
          </section>

          <section className={box}>
            <h2 className={h}>Update status</h2>
            <form action={updateOrderStatus.bind(null, order.id)} className="flex gap-2">
              <select name="status" defaultValue={order.status} className="flex-1 border border-line bg-cream px-3 py-2.5 text-sm">
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button className="bg-brown px-5 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">Save</button>
            </form>
            <p className="mt-3 text-xs text-brown/60">Payment: Cash on delivery</p>
          </section>
        </div>
      </div>
    </>
  );
}
