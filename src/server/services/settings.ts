import { STORE } from "@/lib/config";
import { HERO_INTERVAL } from "@/lib/hero";
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

// Seconds between hero slides, kept within the allowed range.
export async function getHeroInterval() {
  await connectDb();
  const row = await SettingModel.findOne({ key: "heroInterval" }).lean();
  const n = Math.round(Number(row?.value));
  return Number.isFinite(n) && n >= HERO_INTERVAL.min && n <= HERO_INTERVAL.max ? n : HERO_INTERVAL.default;
}

export async function saveHeroInterval(seconds: number) {
  await connectDb();
  await SettingModel.updateOne({ key: "heroInterval" }, { $set: { value: String(seconds) } }, { upsert: true });
}
