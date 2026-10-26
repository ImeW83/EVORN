"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { ORDER_STATUSES } from "@/lib/config";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { OrderModel, isId } from "@/server/models";
import { deleteImage } from "@/server/services/cloudinary";
import { confirmPendingOrder } from "@/server/services/confirm-order";
import { notifyCustomerConfirmed } from "@/server/services/notifications";

type State = { error?: string } | undefined;
type ConfirmedOrder = Parameters<typeof notifyCustomerConfirmed>[0];

function refresh(id: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateOrderStatus(orderId: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!isId(orderId) || !(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await connectDb();

  if (status === "CONFIRMED") {
    // Only a real PENDING -> CONFIRMED change notifies the customer.
    const confirmed = await confirmPendingOrder(orderId);
    if (confirmed) {
      after(() => notifyCustomerConfirmed(confirmed as unknown as ConfirmedOrder));
    } else {
      await OrderModel.updateOne({ _id: orderId }, { status });
    }
  } else {
    await OrderModel.updateOne({ _id: orderId }, { status });
  }
  refresh(orderId);
}

// Marks the bank-transfer payment as checked and confirms the order.
export async function verifyPayment(orderId: string) {
  await requireAdmin();
  if (!isId(orderId)) return;
  await connectDb();
  const order = await OrderModel.findById(orderId);
  if (!order || order.paymentMethod !== "BANK_TRANSFER" || !order.receipt) return;

  const paymentFields = { paymentStatus: "VERIFIED", paymentNote: null };
  const confirmed = await confirmPendingOrder(orderId, paymentFields);
  if (confirmed) {
    after(() => notifyCustomerConfirmed(confirmed as unknown as ConfirmedOrder));
  } else {
    // Already confirmed or past that stage: record the payment check, send nothing.
    await OrderModel.updateOne({ _id: orderId }, { $set: paymentFields });
  }
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
