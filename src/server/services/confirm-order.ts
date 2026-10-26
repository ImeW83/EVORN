import { OrderModel } from "@/server/models";

// Moves an order from PENDING to CONFIRMED in one atomic update.
// Returns the updated order only if this call made the change, otherwise null.
// Callers send the customer notification only when the result is not null,
// so it can never be sent twice for the same confirmation.
// The caller must have called connectDb() first.
export async function confirmPendingOrder(
  orderId: string,
  extra: Record<string, unknown> = {},
) {
  return OrderModel.findOneAndUpdate(
    { _id: orderId, status: "PENDING" },
    { $set: { status: "CONFIRMED", ...extra } },
    { new: true },
  ).lean();
}
