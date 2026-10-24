"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/actions/store/reviews";
import { MAX_REVIEW_NOTE } from "@/lib/config";

export function ReviewForm({ productId, existing }: { productId: string; existing: { rating: number; note: string } | null }) {
  const [state, action, pending] = useActionState(submitReview.bind(null, productId), undefined);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <form action={action} className="space-y-4">
      <fieldset onMouseLeave={() => setHover(0)}>
        <legend className="mb-2 text-[11px] uppercase tracking-[0.2em] text-brown/80">Your rating</legend>
        <div className="flex gap-1 text-3xl leading-none">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} onMouseEnter={() => setHover(n)} className={`cursor-pointer transition ${n <= shown ? "text-tan" : "text-brown/20"} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brown`}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} required className="sr-only" />
              <span aria-hidden>★</span>
              <span className="sr-only">{n} {n === 1 ? "star" : "stars"}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="note" className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-brown/80">Your review (optional)</label>
        <textarea
          id="note"
          name="note"
          rows={4}
          maxLength={MAX_REVIEW_NOTE}
          defaultValue={existing?.note}
          placeholder="What did you think of the piece?"
          className="w-full border border-line bg-cream px-4 py-3 text-sm outline-none focus:border-brown"
        />
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-green-800">Thank you! Your review is live.</p>}
      <button disabled={pending} className="bg-brown px-8 py-3 text-xs uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60">
        {pending ? "Saving…" : existing ? "Update review" : "Post review"}
      </button>
    </form>
  );
}
