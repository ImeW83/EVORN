// Sends SMS through the SMSAPI.lk HTTP API. Never throws: returns a result instead,
// so a failed SMS can never block an order.

export type SmsResult = { ok: true } | { ok: false; error: string };

type SmsInput = {
  to: string | null | undefined; // 94XXXXXXXXX format
  message: string;
};

export function smsConfigured(): boolean {
  return Boolean(
    process.env.SMS_API_URL && process.env.SMS_API_TOKEN && process.env.SMS_SENDER_ID,
  );
}

export async function sendSms({ to, message }: SmsInput): Promise<SmsResult> {
  if (!to) return { ok: false, error: "No recipient phone" };
  if (!smsConfigured()) return { ok: false, error: "SMS is not configured" };

  try {
    const res = await fetch(process.env.SMS_API_URL as string, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SMS_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        recipient: to,
        sender_id: process.env.SMS_SENDER_ID,
        type: "plain",
        message,
      }),
    });

    const data = await res.json().catch(() => null);
    const failed =
      !res.ok || (data && (data.status === false || data.status === "error"));

    if (failed) {
      // Log only the status and the provider's message, never the token or the request.
      console.error("[sms] SMSAPI.lk error", res.status, data?.message);
      return { ok: false, error: data?.message ?? `SMS API returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[sms] Failed to send", err);
    return { ok: false, error: "Network error" };
  }
}
