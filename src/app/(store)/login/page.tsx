import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCustomer } from "@/lib/customer";
import { login } from "../account/actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const dest = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (await getCustomer()) redirect(dest);
  return <AuthForm mode="login" action={login} next={dest} />;
}
