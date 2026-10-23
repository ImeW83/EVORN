import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const COOKIE = "evorn_user";
const MAX_AGE = 60 * 60 * 24 * 30;

const sign = (id: number) =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "dev-secret").update(`user:${id}`).digest("hex");

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

export async function startCustomerSession(userId: number) {
  (await cookies()).set(COOKIE, `${userId}.${sign(userId)}`, {
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

export async function getCustomer() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return null;
  const [idPart, sig] = value.split(".");
  const id = Number(idPart);
  if (!Number.isInteger(id) || !sig || !safeEqual(sig, sign(id))) return null;
  return db.user.findUnique({ where: { id } });
}

export async function requireCustomer() {
  const user = await getCustomer();
  if (!user) redirect("/login");
  return user;
}
