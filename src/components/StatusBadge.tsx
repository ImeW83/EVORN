const styles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-sky-100 text-sky-900",
  SHIPPED: "bg-violet-100 text-violet-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  CANCELLED: "bg-stone-200 text-stone-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] ${styles[status] ?? "bg-sand"}`}>
      {status}
    </span>
  );
}
