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

export function verificationEmailHtml(verifyUrl: string, name?: string) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Confirm your email</title>
</head>
<body style="margin:0;padding:0;background-color:#F6EFE6;">

  <!-- Preheader: preview text shown in the inbox list -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Confirm your email to start ordering from House of Bread. This link expires in 24 hours.
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
                Confirm your email
              </h1>
              <p style="margin:0 0 12px 0;font-size:16px;line-height:1.6;">${greeting}</p>
              <p style="margin:0;font-size:16px;line-height:1.6;">
                Thanks for joining House of Bread. Please verify your email address to activate your account and start ordering.
              </p>
            </td>
          </tr>

          <!-- Bulletproof button (works in Outlook too) -->
          <tr>
            <td align="center" style="padding:28px 32px;">
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${verifyUrl}"
                style="height:48px;v-text-anchor:middle;width:220px;" arcsize="50%" stroke="f" fillcolor="#8B4513">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Georgia,serif;font-size:16px;font-weight:bold;">Verify email</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-- -->
              <a href="${verifyUrl}" target="_blank"
                 style="display:inline-block;background-color:#8B4513;color:#FFFFFF;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:bold;line-height:48px;text-align:center;text-decoration:none;padding:0 36px;border-radius:999px;">
                Verify email
              </a>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td style="padding:0 32px 24px 32px;font-family:Georgia,'Times New Roman',serif;">
              <p style="margin:0;font-size:14px;line-height:1.6;color:#6B5A4A;text-align:center;">
                This link expires in <strong>24 hours</strong>.
              </p>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              <div style="background-color:#FBF6EE;border:1px solid #EADBC8;border-radius:10px;padding:14px 16px;font-family:Georgia,'Times New Roman',serif;">
                <p style="margin:0 0 6px 0;font-size:13px;color:#6B5A4A;">Button not working? Copy and paste this link into your browser:</p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#8B4513;word-break:break-all;">
                  <a href="${verifyUrl}" style="color:#8B4513;text-decoration:underline;">${verifyUrl}</a>
                </p>
              </div>
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

export async function sendVerificationEmail(email: string, verifyUrl: string, name?: string) {
  return sendEmail({
    to: email,
    subject: "Verify your House of Bread account",
    html: verificationEmailHtml(verifyUrl, name),
  });
}
