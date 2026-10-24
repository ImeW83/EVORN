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

export const PAYMENT_METHODS = ["COD", "BANK_TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  COD: "Cash on delivery",
  BANK_TRANSFER: "Bank transfer",
};

// NONE = nothing to verify (cash on delivery). The others track a bank-transfer receipt.
export const PAYMENT_STATUSES = ["NONE", "AWAITING_RECEIPT", "RECEIPT_SUBMITTED", "VERIFIED", "REJECTED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  NONE: "Pay on delivery",
  AWAITING_RECEIPT: "Awaiting receipt",
  RECEIPT_SUBMITTED: "Receipt submitted",
  VERIFIED: "Payment verified",
  REJECTED: "Receipt rejected",
};

// Images are uploaded through server actions; Vercel caps request bodies at 4.5 MB.
export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// A customer can review a product once an order containing it reaches one of these statuses.
export const REVIEWABLE_STATUSES: readonly OrderStatus[] = ["DELIVERED"];
export const MAX_REVIEW_NOTE = 1000;
