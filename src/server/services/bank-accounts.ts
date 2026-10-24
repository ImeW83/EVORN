import { connectDb } from "../db";
import { BankAccountModel } from "../models";
import { plain } from "../serialize";
import type { BankAccount } from "../types";

export async function listBankAccounts({ activeOnly = false } = {}) {
  await connectDb();
  return plain<BankAccount[]>(await BankAccountModel.find(activeOnly ? { active: true } : {}).sort({ _id: 1 }).lean());
}
