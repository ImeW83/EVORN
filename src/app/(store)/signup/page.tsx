import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCustomer } from "@/lib/customer";
import { signup } from "../account/actions";

export const dynamic = "force-dynamic";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { next } = await searchParams;
  const dest = typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  if (await getCustomer()) redirect(dest);
  return <AuthForm mode="signup" action={signup} next={dest} />;
}
