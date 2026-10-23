"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  endCustomerSession,
  hashPassword,
  requireCustomer,
  startCustomerSession,
  verifyPassword,
} from "@/lib/customer";

type FormState = { error?: string; saved?: boolean } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

// Only allow same-site relative redirects.
const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "/account");

export async function signup(_prev: FormState, f: FormData): Promise<FormState> {
  const name = str(f, "name");
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");

  if (!name || !email || !password) return { error: "Please fill in all fields." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };

  const user = await db.user.create({ data: { name, email, passwordHash: hashPassword(password) } });
  await startCustomerSession(user.id);
  redirect(safeNext(str(f, "next")));
}

export async function login(_prev: FormState, f: FormData): Promise<FormState> {
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "");
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  if (!user || !verifyPassword(password, user.passwordHash)) return { error: "Incorrect email or password." };
  await startCustomerSession(user.id);
  redirect(safeNext(str(f, "next")));
}

export async function logout() {
  await endCustomerSession();
  redirect("/");
}

export async function updateProfile(_prev: FormState, f: FormData): Promise<FormState> {
  const user = await requireCustomer();
  const name = str(f, "name");
  const phone = str(f, "phone");
  if (!name) return { error: "Name is required." };
  if (phone && !/^[+\d][\d\s-]{6,}$/.test(phone)) return { error: "Please enter a valid phone number." };
  await db.user.update({
    where: { id: user.id },
    data: { name, phone: phone || null, address: str(f, "address") || null, city: str(f, "city") || null },
  });
  revalidatePath("/account");
  return { saved: true };
}
