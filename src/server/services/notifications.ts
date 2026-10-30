// Builds and sends order notifications (email + SMS).
// Every function here swallows its own errors: a notification must never break an order.

import { sendEmail } from "./email";
import { sendSms } from "./sms";

const BRAND = "EVORN";

type OrderLike = {
  number: string;
  name: string;
  phone: string;
  email?: string | null;
  address: string;
  city: string;
  paymentMethod: string;
  total: number;
  items: { name: string; quantity: number; price: number; options?: { value: string }[] }[];
};

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function money(n: number): string {
  return `Rs. ${Number(n).toLocaleString("en-US")}`;
}

function payLabel(method: string): string {
  return method === "COD" ? "Cash on delivery" : "Bank transfer";
}

// Text.lk wants 94XXXXXXXXX. Old orders may have 07XXXXXXXX or +94...
function toSmsNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("94") && digits.length === 11) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `94${digits.slice(1)}`;
  if (digits.length === 9) return `94${digits}`;
  return null;
}

function itemRows(order: OrderLike): string {
  return order.items
    .map(
      (i) =>
        `<tr><td style="padding:4px 12px 4px 0">${esc(i.name)}${i.options?.length ? ` (${esc(i.options.map((o) => o.value).join(", "))})` : ""} × ${esc(i.quantity)}</td>` +
        `<td style="padding:4px 0;text-align:right">${money(i.price * i.quantity)}</td></tr>`,
    )
    .join("");
}

export async function notifyAdminNewOrder(order: OrderLike): Promise<void> {
  try {
    const html = `
      <h2>New order #${esc(order.number)}</h2>
      <p><strong>${esc(order.name)}</strong><br>
      ${esc(order.phone)}<br>
      ${esc(order.address)}, ${esc(order.city)}</p>
      <table>${itemRows(order)}</table>
      <p><strong>Total: ${money(order.total)}</strong><br>
      Payment: ${payLabel(order.paymentMethod)}</p>
      <p>Open the admin panel to process this order.</p>`;

    const sms = `${BRAND}: New order #${order.number}, ${money(order.total)}, ${payLabel(order.paymentMethod)}. Check admin panel.`;

    await Promise.allSettled([
      sendEmail({
        to: process.env.ADMIN_NOTIFY_EMAIL,
        subject: `New order #${order.number}`,
        html,
      }),
      sendSms({ to: process.env.ADMIN_NOTIFY_PHONE, message: sms }),
    ]);
  } catch (err) {
    console.error("[notify] admin new order failed", err);
  }
}

export async function notifyCustomerConfirmed(order: OrderLike): Promise<void> {
  try {
    const html = `
      <h2>Your order #${esc(order.number)} is confirmed</h2>
      <p>Hi ${esc(order.name)}, thank you for shopping with ${BRAND}. We have confirmed your order and will get it ready.</p>
      <table>${itemRows(order)}</table>
      <p><strong>Total: ${money(order.total)}</strong><br>
      Payment: ${payLabel(order.paymentMethod)}<br>
      Delivery to: ${esc(order.address)}, ${esc(order.city)}</p>
      <p>${BRAND}</p>`;

    const sms = `${BRAND}: Order #${order.number} confirmed. Total ${money(order.total)}. Thank you!`;

    await Promise.allSettled([
      sendEmail({
        to: order.email,
        subject: `Order #${order.number} confirmed`,
        html,
      }),
      sendSms({ to: toSmsNumber(order.phone), message: sms }),
    ]);
  } catch (err) {
    console.error("[notify] customer confirmation failed", err);
  }
}
