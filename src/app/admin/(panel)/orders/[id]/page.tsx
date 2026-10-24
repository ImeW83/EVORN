import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/actions/admin/orders";
import { PaymentReview } from "@/components/admin/PaymentReview";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUSES, PAYMENT_METHOD_LABELS } from "@/lib/config";
import { dateTime, money } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin";
import { receiptUrl } from "@/server/services/cloudinary";
import { getOrderById } from "@/server/services/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetails({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const bank = order.paymentMethod === "BANK_TRANSFER";
  const receipt = order.receipt ? receiptUrl(order.receipt.publicId, order.receipt.format) : null;

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
        <div className="space-y-6">
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
                  <tr key={i.productId}>
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

          <section className={box}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[11px] uppercase tracking-[0.2em] text-tan">Payment</h2>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            <p className="mt-3 text-sm font-medium">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>

            {!bank && <p className="mt-1 text-sm text-brown/70">The customer pays when the order is delivered.</p>}

            {bank && !receipt && (
              <p className="mt-1 text-sm text-brown/70">
                {order.paymentStatus === "REJECTED"
                  ? `Receipt rejected${order.paymentNote ? `: ${order.paymentNote}` : ""}. Waiting for a new one.`
                  : "Waiting for the customer to upload a receipt."}
              </p>
            )}

            {bank && receipt && order.receipt && (
              <div className="mt-4">
                <p className="mb-2 text-xs text-brown/60">Receipt uploaded {dateTime(order.receipt.uploadedAt)}</p>
                <a href={receipt} target="_blank" rel="noreferrer" className="block max-w-sm border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element -- signed Cloudinary URL, shown as-is */}
                  <img src={receipt} alt={`Payment receipt for ${order.number}`} className="w-full" />
                </a>
                <p className="mt-2 text-xs text-brown/60">Check that the amount is {money(order.total)} and the bank shows it received.</p>
                {order.paymentStatus === "RECEIPT_SUBMITTED" && <PaymentReview orderId={order.id} />}
              </div>
            )}

            {bank && order.paymentStatus === "VERIFIED" && (
              <p className="mt-3 text-sm text-green-800">Payment verified.</p>
            )}
          </section>
        </div>

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
          </section>
        </div>
      </div>
    </>
  );
}
