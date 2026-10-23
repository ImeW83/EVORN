export const STORE = {
  name: "EVORN",
  currency: "LKR",
  // Default delivery settings; the admin can override these under Admin > Settings.
  // Flat fee, free once the subtotal reaches the threshold (0 disables free delivery).
  deliveryFee: 450,
  freeDeliveryOver: 100000,
  contactEmail: "hello@evorn.lk",
  contactPhone: "+94 77 000 0000",
};

export function calcDelivery(subtotal: number, { fee, freeOver }: { fee: number; freeOver: number }) {
  if (subtotal === 0) return 0;
  if (freeOver > 0 && subtotal >= freeOver) return 0;
  return fee;
}

export const ORDER_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];
