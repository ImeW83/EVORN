"use server";

import { revalidatePath } from "next/cache";
import { connectDb } from "@/server/db";
import { OrderModel } from "@/server/models";
import { deleteImage, uploadReceipt } from "@/server/services/cloudinary";

type State = { error?: string; saved?: boolean } | undefined;

// The customer uploads the bank-transfer receipt for an order they placed.
export async function submitReceipt(number: string, _prev: State, f: FormData): Promise<State> {
  const file = f.get("receipt");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo or screenshot of your receipt." };

  await connectDb();
  const order = await OrderModel.findOne({ number });
  if (!order || order.paymentMethod !== "BANK_TRANSFER") return { error: "Order not found." };
  if (order.status === "CANCELLED") return { error: "This order has been cancelled." };
  if (order.paymentStatus === "VERIFIED") return { error: "This payment has already been verified." };

  const uploaded = await uploadReceipt(file);
  if ("error" in uploaded) return { error: uploaded.error };

  const old = order.receipt?.publicId;
  order.receipt = { publicId: uploaded.publicId, format: uploaded.format, uploadedAt: new Date() };
  order.paymentStatus = "RECEIPT_SUBMITTED";
  order.paymentNote = null;
  await order.save();
  await deleteImage(old, "authenticated");

  revalidatePath(`/order/${number}`);
  revalidatePath(`/admin/orders/${order.id}`);
  revalidatePath("/admin");
  return { saved: true };
}
