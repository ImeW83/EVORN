import { Types } from "mongoose";
import { REVIEWABLE_STATUSES } from "@/lib/config";
import { connectDb } from "../db";
import { OrderModel, ProductModel, ReviewModel, isId } from "../models";
import { plain } from "../serialize";
import type { RatingSummary, Review } from "../types";

export async function listReviews(productId: string) {
  await connectDb();
  return plain<Review[]>(await ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean());
}

// Average and count per product, for the given products (products with no reviews are left out).
export async function getRatings(productIds: string[]) {
  const ids = productIds.filter(isId).map((id) => new Types.ObjectId(id));
  if (!ids.length) return {} as Record<string, RatingSummary>;
  await connectDb();
  const rows = await ReviewModel.aggregate<{ _id: Types.ObjectId; average: number; count: number }>([
    { $match: { productId: { $in: ids } } },
    { $group: { _id: "$productId", average: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [String(r._id), { average: r.average, count: r.count }])) as Record<string, RatingSummary>;
}

// A customer may review only products from one of their own orders that has been delivered.
export async function hasPurchased(userId: string, productId: string) {
  if (!isId(userId) || !isId(productId)) return false;
  await connectDb();
  return Boolean(
    await OrderModel.exists({ userId, status: { $in: REVIEWABLE_STATUSES }, "items.productId": productId }),
  );
}

export async function getUserReview(userId: string, productId: string) {
  if (!isId(userId) || !isId(productId)) return null;
  await connectDb();
  const review = await ReviewModel.findOne({ userId, productId }).lean();
  return review ? plain<Review>(review) : null;
}

// Admin: every review with the product it belongs to.
export async function listAllReviews() {
  await connectDb();
  const [reviews, products] = await Promise.all([
    ReviewModel.find().sort({ createdAt: -1 }).lean(),
    ProductModel.find().select("name slug").lean(),
  ]);
  const byId = new Map(products.map((p) => [String(p._id), p]));
  return plain<Review[]>(reviews).map((r) => ({
    ...r,
    productName: byId.get(r.productId)?.name ?? "Deleted product",
    productSlug: byId.get(r.productId)?.slug ?? null,
  }));
}
