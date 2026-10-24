"use client";

import { useActionState } from "react";
import { saveSettings } from "@/actions/admin/settings";

const field = "w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown";
const label = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80";

export function SettingsForm({ fee, freeOver }: { fee: number; freeOver: number }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  return (
    <form action={action} className="mt-8 max-w-md space-y-5">
      <div>
        <label htmlFor="deliveryFee" className={label}>Delivery fee (LKR)</label>
        <input id="deliveryFee" name="deliveryFee" type="number" min={0} step={1} required defaultValue={fee} className={field} />
      </div>
      <div>
        <label htmlFor="freeDeliveryOver" className={label}>Free delivery when subtotal reaches (LKR)</label>
        <input id="freeDeliveryOver" name="freeDeliveryOver" type="number" min={0} step={1} required defaultValue={freeOver} className={field} />
        <p className="mt-1 text-xs text-brown/60">Set to 0 to never offer free delivery.</p>
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Saved. New fees apply to all new orders.</p>}
      <button disabled={pending} className="bg-brown px-10 py-3.5 text-xs uppercase tracking-[0.25em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
