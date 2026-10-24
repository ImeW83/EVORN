import { STORE } from "@/lib/config";
import { connectDb } from "../db";
import { SettingModel } from "../models";

export type DeliverySettings = { fee: number; freeOver: number };

// Values saved by the admin override the defaults in config.ts.
export async function getDeliverySettings(): Promise<DeliverySettings> {
  await connectDb();
  const rows = await SettingModel.find({ key: { $in: ["deliveryFee", "freeDeliveryOver"] } }).lean();
  const get = (key: string, fallback: number) => {
    const raw = rows.find((r) => r.key === key)?.value;
    const n = raw === undefined ? NaN : Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return { fee: get("deliveryFee", STORE.deliveryFee), freeOver: get("freeDeliveryOver", STORE.freeDeliveryOver) };
}

export async function saveDeliverySettings({ fee, freeOver }: DeliverySettings) {
  await connectDb();
  await SettingModel.bulkWrite(
    [
      ["deliveryFee", fee],
      ["freeDeliveryOver", freeOver],
    ].map(([key, value]) => ({
      updateOne: { filter: { key }, update: { $set: { value: String(value) } }, upsert: true },
    })),
  );
}
