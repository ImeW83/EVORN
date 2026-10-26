// Sends email through the Resend HTTP API. Never throws: returns a result instead,
// so a failed email can never block an order.

export type EmailResult = { ok: true } | { ok: false; error: string };

type EmailInput = {
  to: string | null | undefined;
  subject: string;
  html: string;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail({ to, subject, html }: EmailInput): Promise<EmailResult> {
  if (!to) return { ok: false, error: "No recipient email" };
  if (!emailConfigured()) return { ok: false, error: "Email is not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        html,
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body);
      return { ok: false, error: `Resend returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] Failed to send", err);
    return { ok: false, error: "Network error" };
  }
}
