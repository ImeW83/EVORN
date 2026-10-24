import { PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/config";

const styles: Record<PaymentStatus, string> = {
  NONE: "bg-stone-200 text-stone-700",
  AWAITING_RECEIPT: "bg-amber-100 text-amber-900",
  RECEIPT_SUBMITTED: "bg-sky-100 text-sky-900",
  VERIFIED: "bg-emerald-100 text-emerald-900",
  REJECTED: "bg-red-100 text-red-800",
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] ${styles[status] ?? "bg-sand"}`}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
