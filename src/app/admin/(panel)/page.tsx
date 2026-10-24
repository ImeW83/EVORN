import Link from "next/link";
import { PaymentBadge } from "@/components/ui/PaymentBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ORDER_STATUSES, PAYMENT_METHOD_LABELS, type OrderStatus } from "@/lib/config";
import { dateTime, money } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin";
import { countOrdersByStatus, listOrders } from "@/server/services/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrders({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const sp = await searchParams;
  const status = typeof sp.status === "string" && (ORDER_STATUSES as readonly string[]).includes(sp.status) ? (sp.status as OrderStatus) : undefined;

  const [orders, counts] = await Promise.all([listOrders(status), countOrdersByStatus()]);
  const all = Object.values(counts).reduce((n, c) => n + (c ?? 0), 0);

  const tabs = [
    { key: undefined as string | undefined, label: "All", n: all },
    ...ORDER_STATUSES.map((s) => ({ key: s as string | undefined, label: s, n: counts[s] ?? 0 })),
  ];

  return (
    <>
      <h1 className="text-5xl">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={t.key ? `/admin?status=${t.key}` : "/admin"}
            className={`border px-4 py-2 text-[11px] uppercase tracking-[0.15em] ${
              status === t.key ? "border-brown bg-brown text-cream" : "border-line hover:border-brown"
            }`}
          >
            {t.label} ({t.n})
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-16 text-center text-brown/70">No orders yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-sand text-[11px] uppercase tracking-[0.15em] text-brown/80">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className={o.paymentStatus === "RECEIPT_SUBMITTED" ? "bg-sky-50 hover:bg-sky-100" : "hover:bg-sand/50"}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium text-brown underline underline-offset-4">
                      {o.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-brown/80">{dateTime(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.name}<span className="block text-xs text-brown/60">{o.phone}</span></td>
                  <td className="px-4 py-3">{o.items.length}</td>
                  <td className="px-4 py-3">{money(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="block text-xs text-brown/70">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</span>
                    {o.paymentMethod === "BANK_TRANSFER" && <PaymentBadge status={o.paymentStatus} />}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
