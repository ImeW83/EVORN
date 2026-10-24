"use server";

import { revalidatePath } from "next/cache";
import { ORDER_STATUSES } from "@/lib/config";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { OrderModel, isId } from "@/server/models";
import { deleteImage } from "@/server/services/cloudinary";

type State = { error?: string } | undefined;

function refresh(id: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!isId(orderId) || !(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await connectDb();
  await OrderModel.updateOne({ _id: orderId }, { status });
  refresh(orderId);
}

// Marks the bank-transfer payment as checked and confirms the order.
export async function verifyPayment(orderId: string) {
  await requireAdmin();
  if (!isId(orderId)) return;
  await connectDb();
  const order = await OrderModel.findById(orderId);
  if (!order || order.paymentMethod !== "BANK_TRANSFER" || !order.receipt) return;
  order.paymentStatus = "VERIFIED";
  order.paymentNote = null;
  if (order.status === "PENDING") order.status = "CONFIRMED";
  await order.save();
  refresh(orderId);
}

// Sends the customer back to upload a new receipt, with a note explaining why.
export async function rejectReceipt(orderId: string, _prev: State, formData: FormData): Promise<State> {
  await requireAdmin();
  if (!isId(orderId)) return { error: "Order not found." };
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return { error: "Add a short reason so the customer knows what to fix." };
  await connectDb();
  const order = await OrderModel.findById(orderId);
  if (!order || order.paymentMethod !== "BANK_TRANSFER") return { error: "Order not found." };
  const old = order.receipt?.publicId;
  order.paymentStatus = "REJECTED";
  order.paymentNote = note;
  order.receipt = null;
  await order.save();
  await deleteImage(old, "authenticated");
  refresh(orderId);
  return undefined;
}
