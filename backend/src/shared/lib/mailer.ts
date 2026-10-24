import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../../config/env.js";
import { sendEmailViaGateway } from "./godaddy-email.js";

let transporter: Transporter | null = null;

function useGodaddyEmail(): boolean {
  if (env.emailTransport === "godaddy") return true;
  if (env.emailTransport === "smtp") return false;
  // auto: platform production / GoDaddy DB present
  return process.env.NODE_ENV === "production" || Boolean(process.env.DB_HOST);
}

function getTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      requireTLS: !env.smtpSecure && env.smtpPort === 587,
    });
  }
  return transporter;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function verificationEmailHtml(otp: string, name?: string) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
  const safeOtp = escapeHtml(otp);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Your verification code</title>
</head>
<body style="margin:0;padding:0;background-color:#F6EFE6;">

  <!-- Preheader: preview text shown in the inbox list -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Your House of Bread verification code is ${safeOtp}. It expires in 30 minutes.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6EFE6;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #EADBC8;">

          <!-- Header band -->
          <tr>
            <td align="center" style="background-color:#8B4513;padding:28px 24px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:1px;color:#FFF8EE;font-weight:bold;">
                House of Bread
              </div>
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:13px;color:#F0D9BC;margin-top:4px;letter-spacing:2px;text-transform:uppercase;">
                Freshly baked, London
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px 8px 32px;font-family:Georgia,'Times New Roman',serif;color:#3F2A18;">
              <h1 style="margin:0 0 16px 0;font-size:24px;line-height:1.3;font-weight:bold;color:#3F2A18;">
                Your verification code
              </h1>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0;font-size:16px;line-height:1.6;">
                Enter this code on the verification page to activate your House of Bread account.
              </p>
            </td>
          </tr>

          <!-- OTP code -->
          <tr>
            <td align="center" style="padding:28px 32px;">
              <div style="background-color:#FBF6EE;border:1px solid #EADBC8;border-radius:12px;padding:20px 24px;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:36px;letter-spacing:8px;font-weight:bold;color:#8B4513;line-height:1.2;">
                  ${safeOtp}
                </div>
              </div>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:0 32px 32px 32px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#6B5A4A;text-align:center;">
                This code expires in <strong>30 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #EADBC8;padding:20px 32px 28px 32px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#9A8575;">
                If you didn't create an account with House of Bread, you can safely ignore this email and no account will be activated.
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9A8575;">
                &copy; ${new Date().getFullYear()} House of Bread &middot; London, UK
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (useGodaddyEmail()) {
    try {
      // Omit `from` — gateway uses verified/canonical sender on PaaS.
      await sendEmailViaGateway({
        to: input.to,
        subject: input.subject,
        html: input.html,
      });
      return { ok: true };
    } catch (err) {
      console.error("[mailer] GoDaddy gateway send failed:", err);
      return { ok: false, error: "Failed to send email" };
    }
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.warn("[mailer] SMTP not configured; email not sent:", input.subject, input.to);
    return { ok: false, error: "Email service not configured" };
  }

  try {
    await mailer.sendMail({
      from: env.mailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return { ok: true };
  } catch (err) {
    console.error("[mailer] send failed:", err);
    return { ok: false, error: (err as Error).message };
  }
}

export async function sendVerificationEmail(email: string, otp: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Your House of Bread verification code",
    html: verificationEmailHtml(otp, name),
  });
}

export type InvoiceReminderEmailInput = {
  to: string;
  contactName?: string;
  businessName: string;
  invoiceNumber: string;
  amountDue: number;
  dueDate: string;
  kind: "pre_due" | "due";
};

function invoiceReminderEmailHtml(input: InvoiceReminderEmailInput) {
  const greeting = input.contactName
    ? `Hi ${escapeHtml(input.contactName)},`
    : "Hello,";
  const title =
    input.kind === "pre_due"
      ? "Invoice payment reminder"
      : "Invoice due today";
  const body =
    input.kind === "pre_due"
      ? `This is a friendly reminder that invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> for <strong>${escapeHtml(input.businessName)}</strong> is due in 2 days.`
      : `Invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> for <strong>${escapeHtml(input.businessName)}</strong> is due today.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#F6EFE6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F6EFE6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:560px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #EADBC8;">
          <tr>
            <td align="center" style="background-color:#8B4513;padding:28px 24px;">
              <div style="font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:1px;color:#FFF8EE;font-weight:bold;">
                House of Bread
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;font-family:Georgia,'Times New Roman',serif;color:#3F2A18;">
              <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:bold;">${title}</h1>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0 0 16px 0;font-size:16px;line-height:1.6;">${body}</p>
              <p style="margin:0;font-size:16px;line-height:1.6;">
                Amount due: <strong>£${input.amountDue.toFixed(2)}</strong><br />
                Due date: <strong>${escapeHtml(input.dueDate)}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #EADBC8;padding:20px 32px 28px 32px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#9A8575;">
                &copy; ${new Date().getFullYear()} House of Bread &middot; London, UK
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInvoiceReminderEmail(input: InvoiceReminderEmailInput) {
  const subject =
    input.kind === "pre_due"
      ? `Reminder: invoice ${input.invoiceNumber} due soon`
      : `Invoice ${input.invoiceNumber} is due today`;
  return sendEmail({
    to: input.to,
    subject,
    html: invoiceReminderEmailHtml(input),
  });
}
