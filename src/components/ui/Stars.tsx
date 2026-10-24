// Read-only star rating; fractional values fill the last star partially.
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span role="img" aria-label={`${value.toFixed(1)} out of 5 stars`} className={`relative inline-block leading-none tracking-[0.1em] text-brown/20 ${className}`}>
      <span aria-hidden>★★★★★</span>
      <span aria-hidden className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-tan" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}
