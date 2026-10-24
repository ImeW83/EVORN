import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "evorn_admin";

const sign = () =>
  createHmac("sha256", process.env.SESSION_SECRET ?? "dev-secret").update("admin").digest("hex");

export function passwordMatches(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  return a.length === b.length && b.length > 0 && timingSafeEqual(a, b);
}

export async function startAdminSession() {
  (await cookies()).set(COOKIE, sign(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(sign());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
