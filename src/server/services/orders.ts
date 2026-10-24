import { randomBytes } from "node:crypto";
import type { OrderStatus } from "@/lib/config";
import { connectDb } from "../db";
import { OrderModel, isId } from "../models";
import { plain } from "../serialize";
import type { Order } from "../types";

// The number doubles as the customer's link to their order page, so keep it hard to guess.
export const newOrderNumber = () => `EV-${Date.now().toString(36).toUpperCase()}${randomBytes(5).toString("hex").toUpperCase()}`;

export async function getOrderByNumber(number: string) {
  await connectDb();
  const order = await OrderModel.findOne({ number }).lean();
  return order ? plain<Order>(order) : null;
}

export async function getOrderById(id: string) {
  if (!isId(id)) return null;
  await connectDb();
  const order = await OrderModel.findById(id).lean();
  return order ? plain<Order>(order) : null;
}

export async function listOrdersForUser(userId: string) {
  await connectDb();
  return plain<Order[]>(await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean());
}

export async function listOrders(status?: OrderStatus) {
  await connectDb();
  return plain<Order[]>(await OrderModel.find(status ? { status } : {}).sort({ createdAt: -1 }).lean());
}

export async function countOrdersByStatus() {
  await connectDb();
  const rows = await OrderModel.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  return Object.fromEntries(rows.map((r) => [r._id, r.n])) as Partial<Record<OrderStatus, number>>;
}
