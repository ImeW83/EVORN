import { getCustomer } from "@/lib/customer";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCustomer();
  return (
    <CheckoutForm
      loggedIn={!!user}
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
