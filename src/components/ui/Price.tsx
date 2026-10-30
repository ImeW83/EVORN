import { money } from "@/lib/format";

// Selling price, followed by the original price struck through when the product is discounted.
// `upTo` turns it into a range (e.g. "LKR 1,690 – LKR 1,990") for products whose options cost extra.
export function Price({
  price, originalPrice, upTo = 0, className = "",
}: { price: number; originalPrice?: number | null; upTo?: number; className?: string }) {
  const discounted = originalPrice != null && originalPrice > price;
  const show = (n: number) => (upTo > 0 ? `${money(n)} – ${money(n + upTo)}` : money(n));
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span>
        {discounted && <span className="sr-only">Now </span>}
        {show(price)}
      </span>
      {discounted && (
        <s className="text-[0.85em] text-brown/50">
          <span className="sr-only">was </span>
          {show(originalPrice)}
        </s>
      )}
    </p>
  );
}
