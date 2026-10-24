"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/admin";
import { saveDeliverySettings } from "@/server/services/settings";

type State = { error?: string; saved?: boolean } | undefined;

export async function saveSettings(_prev: State, f: FormData): Promise<State> {
  await requireAdmin();
  const fee = Math.round(Number(f.get("deliveryFee")));
  const freeOver = Math.round(Number(f.get("freeDeliveryOver")));
  if (![fee, freeOver].every((n) => Number.isFinite(n) && n >= 0)) return { error: "Enter valid amounts (0 or more)." };
  await saveDeliverySettings({ fee, freeOver });
  revalidatePath("/", "layout");
  return { saved: true };
}
