"use client";

import { useDelivery } from "./DeliveryProvider";
import { calcDelivery } from "@/lib/config";
import { money } from "@/lib/format";

export function OrderSummary({ subtotal, children }: { subtotal: number; children?: React.ReactNode }) {
  const settings = useDelivery();
  const delivery = calcDelivery(subtotal, settings);
  const total = subtotal + delivery;
  const remaining = settings.freeOver - subtotal;

  return (
    <aside className="self-start border border-line bg-sand/60 p-6">
      <h2 className="text-3xl">Order summary</h2>
      {children}
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{money(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd>{delivery === 0 ? "Free" : money(delivery)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-lg font-medium">
          <dt>Total</dt>
          <dd>{money(total)}</dd>
        </div>
      </dl>
      {settings.freeOver > 0 && remaining > 0 && subtotal > 0 && (
        <p className="mt-4 text-xs text-brown/70">Add {money(remaining)} more for free delivery.</p>
      )}
    </aside>
  );
}
