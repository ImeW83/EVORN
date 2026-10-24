"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { connectDb } from "@/server/db";
import { BankAccountModel, isId } from "@/server/models";

type State = { error?: string; saved?: boolean } | undefined;

function parse(f: FormData) {
  const str = (k: string) => String(f.get(k) ?? "").trim();
  const data = { bank: str("bank"), accountName: str("accountName"), accountNumber: str("accountNumber"), branch: str("branch") };
  if (Object.values(data).some((v) => !v)) return { error: "Bank, account name, account number and branch are all required." } as const;
  return { data: { ...data, active: f.get("active") === "on" } } as const;
}

function refresh() {
  revalidatePath("/admin/bank-accounts");
  revalidatePath("/checkout");
  revalidatePath("/order/[number]", "page");
}

export async function createBankAccount(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const parsed = parse(f);
  if ("error" in parsed) return { error: parsed.error };
  await connectDb();
  await BankAccountModel.create(parsed.data);
  refresh();
  return { saved: true };
}

export async function updateBankAccount(id: string, _prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { error: "Account not found." };
  const parsed = parse(f);
  if ("error" in parsed) return { error: parsed.error };
  await connectDb();
  await BankAccountModel.updateOne({ _id: id }, parsed.data);
  refresh();
  return { saved: true };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- first arg is the previous state from useActionState
export async function deleteBankAccount(id: string, _prev: State): Promise<State> {
  await requireAdmin();
  if (!isId(id)) return { saved: true };
  await connectDb();
  await BankAccountModel.deleteOne({ _id: id });
  refresh();
  return { saved: true };
}
