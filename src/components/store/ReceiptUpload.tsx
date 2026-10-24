"use client";

import { useActionState } from "react";
import { submitReceipt } from "@/actions/store/payment";

export function ReceiptUpload({ number, replacing }: { number: string; replacing: boolean }) {
  const [state, action, pending] = useActionState(submitReceipt.bind(null, number), undefined);
  return (
    <form action={action} className="mt-4 space-y-3">
      <label htmlFor="receipt" className="block text-[11px] uppercase tracking-[0.2em] text-brown/80">
        {replacing ? "Upload a new receipt" : "Upload your receipt"} (JPG, PNG or WebP, max 3.5 MB)
      </label>
      <input id="receipt" name="receipt" type="file" required accept="image/jpeg,image/png,image/webp" className="block text-sm" />
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Receipt received. We will check it and confirm your order.</p>}
      <button disabled={pending} className="bg-brown px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Uploading…" : replacing ? "Replace receipt" : "Send receipt"}
      </button>
    </form>
  );
}
