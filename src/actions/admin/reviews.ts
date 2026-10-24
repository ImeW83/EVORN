"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { ProductModel, ReviewModel, isId } from "@/server/models";

export async function deleteReview(id: string) {
  await requireAdmin();
  if (!isId(id)) return;
  await connectDb();
  const review = await ReviewModel.findByIdAndDelete(id).lean();
  if (review) {
    const product = await ProductModel.findById(review.productId).select("slug").lean();
    if (product) revalidatePath(`/product/${product.slug}`);
  }
  revalidatePath("/admin/reviews");
}
