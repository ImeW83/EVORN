import type { BankAccount } from "@/server/types";

export function BankAccountList({ accounts }: { accounts: BankAccount[] }) {
  return (
    <ul className="space-y-3">
      {accounts.map((a) => (
        <li key={a.id} className="border border-line bg-cream p-4 text-sm">
          <p className="font-medium">{a.bank}</p>
          <dl className="mt-2 grid grid-cols-[110px_1fr] gap-y-1">
            <dt className="text-brown/70">Account name</dt>
            <dd>{a.accountName}</dd>
            <dt className="text-brown/70">Account number</dt>
            <dd className="font-medium tracking-wide">{a.accountNumber}</dd>
            <dt className="text-brown/70">Branch</dt>
            <dd>{a.branch}</dd>
          </dl>
        </li>
      ))}
    </ul>
  );
}
