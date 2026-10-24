import { CheckoutForm } from "@/components/store/CheckoutForm";
import { getCustomer } from "@/server/auth/customer";
import { listBankAccounts } from "@/server/services/bank-accounts";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [user, bankAccounts] = await Promise.all([getCustomer(), listBankAccounts({ activeOnly: true })]);
  return (
    <CheckoutForm
      loggedIn={!!user}
      bankAccounts={bankAccounts}
      prefill={{
        name: user?.name ?? "",
        phone: user?.phone ?? "",
        email: user?.email ?? "",
        address: user?.address ?? "",
        city: user?.city ?? "",
      }}
    />
  );
}
