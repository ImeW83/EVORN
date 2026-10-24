import { redirect } from "next/navigation";
import { AuthForm } from "@/components/account/AuthForm";
import { getCustomer } from "@/server/auth/customer";
import { login } from "@/actions/store/account";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const dest = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (await getCustomer()) redirect(dest);
  return <AuthForm mode="login" action={login} next={dest} />;
}
