"use client";

import { createContext, useContext } from "react";
import type { DeliverySettings } from "@/server/services/settings";

const DeliveryContext = createContext<DeliverySettings>({ fee: 0, freeOver: 0 });

export const useDelivery = () => useContext(DeliveryContext);

export function DeliveryProvider({ value, children }: { value: DeliverySettings; children: React.ReactNode }) {
  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}
