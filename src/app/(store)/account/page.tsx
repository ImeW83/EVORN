import Link from "next/link";
import { ProfileForm } from "@/components/ProfileForm";
import { StatusBadge } from "@/components/StatusBadge";
import { requireCustomer } from "@/lib/customer";
import { db } from "@/lib/db";
import { money } from "@/lib/format";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCustomer();
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-5xl">Hello, {user.name.split(" ")[0]}</h1>
        <form action={logout}>
          <button className="text-xs uppercase tracking-[0.2em] underline">Log out</button>
        </form>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <section>
          <h2 className="text-3xl">Your details</h2>
          <ProfileForm user={user} />
        </section>

        <section>
          <h2 className="text-3xl">Your orders</h2>
          {orders.length === 0 ? (
            <p className="mt-6 text-brown/80">
              No orders yet.{" "}
              <Link href="/shop" className="underline">Browse jewellery</Link>
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-line border border-line">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.number}`} className="block p-4 hover:bg-sand/60">
                    <div className="flex items-center justify-between gap-3">
                      <strong className="text-sm">{o.number}</strong>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="mt-2 text-sm text-brown/70">
                      {o.createdAt.toLocaleDateString("en-GB")} · {o.items.reduce((n, i) => n + i.quantity, 0)} item(s) · {money(o.total)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
