"use client";

import { useActionState } from "react";
import { rejectReceipt, verifyPayment } from "@/actions/admin/orders";

// Verify / reject controls for a submitted bank-transfer receipt.
export function PaymentReview({ orderId }: { orderId: string }) {
  const [state, reject, pending] = useActionState(rejectReceipt.bind(null, orderId), undefined);
  return (
    <div className="mt-5 space-y-4">
      <form action={verifyPayment.bind(null, orderId)}>
        <button className="w-full bg-brown py-3 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark">
          Payment received — confirm order
        </button>
      </form>
      <form action={reject} className="space-y-2 border-t border-line pt-4">
        <label htmlFor="note" className="block text-[11px] uppercase tracking-[0.2em] text-brown/80">Or reject the receipt</label>
        <textarea id="note" name="note" rows={2} required placeholder="Reason shown to the customer, e.g. amount does not match" className="w-full border border-line bg-pearl px-3 py-2 text-sm" />
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="border border-red-700 px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-red-700 hover:bg-red-50 disabled:opacity-60">
          Reject receipt
        </button>
      </form>
    </div>
  );
}
