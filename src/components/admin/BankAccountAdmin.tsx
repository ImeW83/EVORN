"use client";

import { useActionState } from "react";
import { createBankAccount, deleteBankAccount, updateBankAccount } from "@/actions/admin/bank-accounts";
import type { BankAccount } from "@/server/types";

const field = "w-full border border-line bg-pearl px-3 py-2.5 text-sm outline-none focus:border-brown";
const label = "mb-1 block text-[11px] uppercase tracking-[0.2em] text-brown/80";
const btn = "bg-brown px-5 py-2.5 text-[11px] uppercase tracking-[0.2em] text-cream hover:bg-brown-dark disabled:opacity-60";

function Fields({ account }: { account?: BankAccount }) {
  const input = (name: string, text: string, value?: string) => (
    <div>
      <label className={label}>{text}</label>
      <input name={name} required defaultValue={value} className={field} />
    </div>
  );
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {input("bank", "Bank", account?.bank)}
      {input("accountName", "Account name", account?.accountName)}
      {input("accountNumber", "Account number", account?.accountNumber)}
      {input("branch", "Branch", account?.branch)}
    </div>
  );
}

export function AddBankAccount() {
  const [state, action, pending] = useActionState(createBankAccount, undefined);
  return (
    <form action={action} key={state?.saved ? "saved" : "form"} className="mt-6 max-w-2xl space-y-4 border border-line p-5">
      <h2 className="text-2xl">Add a bank account</h2>
      <Fields />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Show to customers</label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className={btn}>{pending ? "Adding…" : "Add account"}</button>
    </form>
  );
}

export function BankAccountRow({ account }: { account: BankAccount }) {
  const [update, updateAction, updating] = useActionState(updateBankAccount.bind(null, account.id), undefined);
  const [del, delAction, deleting] = useActionState(deleteBankAccount.bind(null, account.id), undefined);
  return (
    <li className="p-5">
      <form action={updateAction} className="space-y-4">
        <Fields account={account} />
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={account.active} /> Show to customers</label>
          <button disabled={updating} className={btn}>Save</button>
          {update?.saved && <span role="status" className="text-sm text-green-800">Saved</span>}
          {update?.error && <span role="alert" className="text-sm text-red-700">{update.error}</span>}
        </div>
      </form>
      <form action={delAction} className="mt-3">
        {del?.error && <span role="alert" className="mr-3 text-sm text-red-700">{del.error}</span>}
        <button
          disabled={deleting}
          onClick={(e) => { if (!confirm(`Delete the ${account.bank} account?`)) e.preventDefault(); }}
          className="text-xs uppercase tracking-[0.2em] text-red-700 underline hover:text-red-900"
        >
          Delete
        </button>
      </form>
    </li>
  );
}
