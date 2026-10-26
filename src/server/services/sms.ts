// Sends SMS through the Text.lk HTTP API. Never throws: returns a result instead,
// so a failed SMS can never block an order.

export type SmsResult = { ok: true } | { ok: false; error: string };

type SmsInput = {
  to: string | null | undefined; // 94XXXXXXXXX format
  message: string;
};

export function smsConfigured(): boolean {
  return Boolean(process.env.TEXTLK_API_TOKEN && process.env.TEXTLK_SENDER_ID);
}

export async function sendSms({ to, message }: SmsInput): Promise<SmsResult> {
  if (!to) return { ok: false, error: "No recipient phone" };
  if (!smsConfigured()) return { ok: false, error: "SMS is not configured" };

  try {
    const res = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: to,
        sender_id: process.env.TEXTLK_SENDER_ID,
        type: "plain",
        message,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || (data && data.status === false)) {
      console.error("[sms] Text.lk error", res.status, data?.message);
      return { ok: false, error: data?.message ?? `Text.lk returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[sms] Failed to send", err);
    return { ok: false, error: "Network error" };
  }
}
