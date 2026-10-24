"use server";

import { revalidatePath } from "next/cache";
import { MAX_REVIEW_NOTE } from "@/lib/config";
import { requireCustomer } from "@/server/auth/customer";
import { connectDb } from "@/server/db";
import { ProductModel, ReviewModel, isId } from "@/server/models";
import { hasPurchased } from "@/server/services/reviews";

type State = { error?: string; saved?: boolean } | undefined;

// "Amara Perera" is shown as "Amara P." so customers' full names are not published.
function publicName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : first;
}

export async function submitReview(productId: string, _prev: State, f: FormData): Promise<State> {
  const user = await requireCustomer();
  const rating = Number(f.get("rating"));
  const note = String(f.get("note") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { error: "Choose a star rating from 1 to 5." };
  if (note.length > MAX_REVIEW_NOTE) return { error: `Please keep your review under ${MAX_REVIEW_NOTE} characters.` };
  if (!isId(productId)) return { error: "Product not found." };

  await connectDb();
  const product = await ProductModel.findById(productId).select("slug").lean();
  if (!product) return { error: "Product not found." };
  // Checked here on the server, so the form cannot be bypassed.
  if (!(await hasPurchased(user.id, productId))) {
    return { error: "Only customers who have received this product can review it." };
  }

  await ReviewModel.updateOne(
    { productId, userId: user.id },
    { $set: { rating, note, userName: publicName(user.name) } },
    { upsert: true },
  );
  revalidatePath(`/product/${product.slug}`);
  return { saved: true };
}
