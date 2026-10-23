"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, requireAdmin, startAdminSession } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/config";
import { db } from "@/lib/db";

export async function login(_prev: { error: string } | undefined, formData: FormData) {
  if (!passwordMatches(String(formData.get("password") ?? ""))) return { error: "Incorrect password." };
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

export async function updateOrderStatus(orderId: number, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  await db.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
}
