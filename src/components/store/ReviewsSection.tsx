import Link from "next/link";
import { getCustomer } from "@/server/auth/customer";
import { getUserReview, hasPurchased, listReviews } from "@/server/services/reviews";
import { Stars } from "../ui/Stars";
import { ReviewForm } from "./ReviewForm";

export async function ReviewsSection({ productId, slug }: { productId: string; slug: string }) {
  const [reviews, user] = await Promise.all([listReviews(productId), getCustomer()]);
  const average = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;

  const [purchased, existing] = user
    ? await Promise.all([hasPurchased(user.id, productId), getUserReview(user.id, productId)])
    : [false, null];

  return (
    <section className="mt-24 border-t border-line pt-16" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews-heading" className="text-4xl">Customer reviews</h2>
        {reviews.length > 0 && (
          <p className="flex items-center gap-3 text-sm">
            <Stars value={average} className="text-xl" />
            <span>{average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          {reviews.length === 0 ? (
            <p className="text-brown/70">No reviews yet. Be the first to share your thoughts once your order arrives.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.id} className="py-6 first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Stars value={r.rating} className="text-lg" />
                    <span className="font-medium">{r.userName}</span>
                    <span className="text-[11px] uppercase tracking-[0.15em] text-tan">Verified purchase</span>
                    <time dateTime={r.createdAt.toISOString()} className="text-xs text-brown/60">
                      {r.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </time>
                  </div>
                  {r.note && <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-brown-dark/85">{r.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="self-start border border-line bg-sand/50 p-6">
          <h3 className="text-2xl">{existing ? "Your review" : "Write a review"}</h3>
          <div className="mt-4">
            {!user ? (
              <p className="text-sm text-brown/80">
                <Link href={`/login?next=/product/${slug}`} className="underline">Log in</Link> to review a product you have bought.
              </p>
            ) : !purchased ? (
              <p className="text-sm text-brown/80">Only customers who have received this product can review it.</p>
            ) : (
              <ReviewForm productId={productId} existing={existing ? { rating: existing.rating, note: existing.note } : null} />
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
