import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { logger } from "./logger.js";

let smtpTransport: Transporter | null = null;

function getSmtpTransport() {
  if (env.emailTransport !== "smtp") return null;
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      requireTLS: !env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPass },
      // Fail fast if the host blocks outbound SMTP instead of hanging the request.
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return smtpTransport;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const transport = getSmtpTransport();
  if (!transport) {
    logger.warn({ subject: input.subject }, "email transport disabled; email not sent");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    await transport.sendMail({
      from: env.mailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    logger.info({ subject: input.subject }, "email sent");
    return { ok: true };
  } catch (err) {
    logger.error({ err, subject: input.subject }, "email send failed");
    return { ok: false, error: "Failed to send email" };
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
