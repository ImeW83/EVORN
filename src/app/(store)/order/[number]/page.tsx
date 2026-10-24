import Link from "next/link";
import { notFound } from "next/navigation";
import { BankAccountList } from "@/components/store/BankAccountList";
import { ReceiptUpload } from "@/components/store/ReceiptUpload";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { money } from "@/lib/format";
import { listBankAccounts } from "@/server/services/bank-accounts";
import { getOrderByNumber } from "@/server/services/orders";

export const dynamic = "force-dynamic";

export default async function OrderConfirmation({ params }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const order = await getOrderByNumber(number);
  if (!order) notFound();

  const bank = order.paymentMethod === "BANK_TRANSFER";
  const needsReceipt = bank && order.status !== "CANCELLED" && order.paymentStatus !== "VERIFIED";
  const accounts = needsReceipt ? await listBankAccounts({ activeOnly: true }) : [];

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.3em] text-tan">Thank you, {order.name.split(" ")[0]}</p>
      <h1 className="mt-3 text-5xl">Your order is placed</h1>
      <p className="mt-3 text-brown/80">
        Order number <strong>{order.number}</strong>. We will contact you on {order.phone} to confirm delivery.
      </p>

      {bank && (
        <section className="mt-10 border border-line p-6 text-left text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl">Bank transfer payment</h2>
            <PaymentBadge status={order.paymentStatus} />
          </div>

          {order.paymentStatus === "VERIFIED" && (
            <p className="mt-3 text-brown/80">We have received your payment. Thank you!</p>
          )}

          {order.paymentStatus === "RECEIPT_SUBMITTED" && (
            <p className="mt-3 text-brown/80">We have your receipt and will confirm your order after checking it.</p>
          )}

          {order.paymentStatus === "REJECTED" && (
            <p role="alert" className="mt-3 border border-red-300 bg-red-50 px-4 py-3 text-red-800">
              We could not accept your receipt{order.paymentNote ? `: ${order.paymentNote}` : "."} Please upload a new one.
            </p>
          )}

          {needsReceipt && (
            <>
              <p className="mt-4 text-brown/80">
                Transfer <strong>{money(order.total)}</strong> to one of these accounts and use <strong>{order.number}</strong> as the
                reference.
              </p>
              <div className="mt-4">
                {accounts.length > 0 ? (
                  <BankAccountList accounts={accounts} />
                ) : (
                  <p className="text-brown/70">Bank details are unavailable right now. Please contact us.</p>
                )}
              </div>
              <ReceiptUpload number={order.number} replacing={order.paymentStatus === "RECEIPT_SUBMITTED"} />
            </>
          )}
        </section>
      )}

      <div className="mt-10 border border-line bg-sand/60 p-6 text-left text-sm">
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.productId} className="flex justify-between py-3">
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
        <p className="mt-4 text-brown/70">
          Delivering to {order.address}, {order.city}. {bank ? "Payment by bank transfer." : "Payment on delivery."}
        </p>
      </div>

      <Link href="/shop" className="mt-10 inline-block bg-brown px-10 py-4 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
        Continue shopping
      </Link>
    </div>
  );
}
