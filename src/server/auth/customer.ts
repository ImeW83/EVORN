import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDb } from "../db";
import { UserModel, isId } from "../models";
import { plain } from "../serialize";
import type { User } from "../types";
import { signToken, verifyToken } from "./jwt";

const COOKIE = "evorn_user";
const MAX_AGE = 60 * 60 * 24 * 30;

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  return safeEqual(scryptSync(password, salt, 64).toString("hex"), hash);
}

export async function startCustomerSession(userId: string) {
  (await cookies()).set(COOKIE, await signToken("customer", userId, MAX_AGE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endCustomerSession() {
  (await cookies()).delete(COOKIE);
}

export async function getCustomer(): Promise<User | null> {
  const id = await verifyToken((await cookies()).get(COOKIE)?.value, "customer");
  if (!isId(id)) return null;
  await connectDb();
  const user = await UserModel.findById(id).lean();
  return user ? plain<User>(user) : null;
}

export async function requireCustomer() {
  const user = await getCustomer();
  if (!user) redirect("/login");
  return user;
}
