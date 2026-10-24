import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signToken, verifyToken } from "./jwt";

const COOKIE = "evorn_admin";
const MAX_AGE = 60 * 60 * 12;

export function passwordMatches(input: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(process.env.ADMIN_PASSWORD ?? "");
  return a.length === b.length && b.length > 0 && timingSafeEqual(a, b);
}

export async function startAdminSession() {
  (await cookies()).set(COOKIE, await signToken("admin", "admin", MAX_AGE), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  return (await verifyToken((await cookies()).get(COOKIE)?.value, "admin")) === "admin";
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
