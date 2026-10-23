import { STORE } from "@/lib/config";
import { db } from "@/lib/db";

export type DeliverySettings = { fee: number; freeOver: number };

// Values saved by the admin override the defaults in config.ts.
export async function getDeliverySettings(): Promise<DeliverySettings> {
  const rows = await db.setting.findMany({ where: { key: { in: ["deliveryFee", "freeDeliveryOver"] } } });
  const get = (key: string, fallback: number) => {
    const n = Number(rows.find((r) => r.key === key)?.value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return { fee: get("deliveryFee", STORE.deliveryFee), freeOver: get("freeDeliveryOver", STORE.freeDeliveryOver) };
}
