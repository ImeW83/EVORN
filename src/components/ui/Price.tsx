import { money } from "@/lib/format";

// Selling price, followed by the original price struck through when the product is discounted.
export function Price({ price, originalPrice, className = "" }: { price: number; originalPrice?: number | null; className?: string }) {
  const discounted = originalPrice != null && originalPrice > price;
  return (
    <p className={`flex flex-wrap items-baseline gap-x-2 ${className}`}>
      <span>
        {discounted && <span className="sr-only">Now </span>}
        {money(price)}
      </span>
      {discounted && (
        <s className="text-[0.85em] text-brown/50">
          <span className="sr-only">was </span>
          {money(originalPrice)}
        </s>
      )}
    </p>
  );
}
