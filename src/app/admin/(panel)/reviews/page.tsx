import Link from "next/link";
import { deleteReview } from "@/actions/admin/reviews";
import { Stars } from "@/components/ui/Stars";
import { dateTime } from "@/lib/format";
import { requireAdmin } from "@/server/auth/admin";
import { listAllReviews } from "@/server/services/reviews";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  await requireAdmin();
  const reviews = await listAllReviews();
  return (
    <>
      <h1 className="text-5xl">Reviews</h1>
      <p className="mt-3 max-w-2xl text-sm text-brown/70">
        Only customers with a delivered order can post a review. Remove anything abusive or off-topic here.
      </p>

      {reviews.length === 0 ? (
        <p className="mt-16 text-center text-brown/70">No reviews yet.</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border border-line">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Stars value={r.rating} className="text-lg" />
                  <span className="font-medium">{r.userName}</span>
                  <span className="text-xs text-brown/60">{dateTime(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm text-brown/70">
                  on{" "}
                  {r.productSlug ? (
                    <Link href={`/product/${r.productSlug}`} className="underline">{r.productName}</Link>
                  ) : (
                    r.productName
                  )}
                </p>
                {r.note && <p className="mt-3 whitespace-pre-line text-sm">{r.note}</p>}
              </div>
              <form action={deleteReview.bind(null, r.id)}>
                <button className="text-xs uppercase tracking-[0.2em] text-red-700 underline hover:text-red-900">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
