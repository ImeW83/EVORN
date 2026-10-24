"use server";

import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, startAdminSession } from "@/server/auth/admin";

export async function login(_prev: { error: string } | undefined, formData: FormData) {
  if (!passwordMatches(String(formData.get("password") ?? ""))) return { error: "Incorrect password." };
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}
