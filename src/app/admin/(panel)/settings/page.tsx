import { SettingsForm } from "@/components/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getDeliverySettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminSettings() {
  await requireAdmin();
  const { fee, freeOver } = await getDeliverySettings();
  return (
    <>
      <h1 className="text-5xl">Settings</h1>
      <h2 className="mt-8 text-3xl">Delivery</h2>
      <SettingsForm fee={fee} freeOver={freeOver} />
    </>
  );
}
