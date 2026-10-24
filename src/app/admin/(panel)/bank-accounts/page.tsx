import { AddBankAccount, BankAccountRow } from "@/components/admin/BankAccountAdmin";
import { requireAdmin } from "@/server/auth/admin";
import { listBankAccounts } from "@/server/services/bank-accounts";

export const dynamic = "force-dynamic";

export default async function AdminBankAccounts() {
  await requireAdmin();
  const accounts = await listBankAccounts();
  return (
    <>
      <h1 className="text-5xl">Bank accounts</h1>
      <p className="mt-3 max-w-2xl text-sm text-brown/70">
        Customers who choose bank transfer see the accounts marked “Show to customers” at checkout and on their order page.
      </p>
      <AddBankAccount />
      <ul className="mt-8 max-w-2xl divide-y divide-line border border-line">
        {accounts.map((a) => (
          <BankAccountRow key={a.id} account={a} />
        ))}
        {accounts.length === 0 && <li className="p-6 text-center text-brown/70">No bank accounts yet.</li>}
      </ul>
    </>
  );
}
