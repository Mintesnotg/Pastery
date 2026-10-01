import { Resend } from "resend";
import { env } from "../../config/env.js";

let client: Resend | null = null;

function getResend() {
  if (!env.resendApiKey) return null;
  if (!client) client = new Resend(env.resendApiKey);
  return client;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[mailer] RESEND_API_KEY missing; email not sent:", input.subject, input.to);
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from: env.mailFrom,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    });
    if (error) {
      console.error("[mailer] Resend error:", error);
      return { ok: false, error: error.message ?? "Failed to send email" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  return sendEmail({
    to: email,
    subject: "Verify your House of Bread account",
    html: `
      <div style="font-family: Georgia, serif; color: #3F2A18; line-height: 1.5;">
        <h1 style="font-size: 22px;">Confirm your email</h1>
        <p>Thanks for joining House of Bread. Click the button below to verify your account.</p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}"
             style="background:#8B4513;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600;">
            Verify email
          </a>
        </p>
        <p style="font-size: 13px; color: #6B5A4A;">Or open this link:<br/>${verifyUrl}</p>
        <p style="font-size: 12px; color: #9A8575;">This link expires in 24 hours.</p>
      </div>
    `,
  });
}
