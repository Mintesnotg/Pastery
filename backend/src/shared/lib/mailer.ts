import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "../../config/env.js";

let transporter: Transporter | null = null;

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

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  // #region agent log
  const pass = env.smtpPass;
  fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
    body: JSON.stringify({
      sessionId: "f1fde4",
      runId: "post-fix",
      hypothesisId: "A",
      location: "mailer.ts:sendEmail:entry",
      message: "SMTP env snapshot (no secrets)",
      data: {
        host: env.smtpHost,
        port: env.smtpPort,
        secure: env.smtpSecure,
        user: env.smtpUser,
        mailFrom: env.mailFrom,
        passLength: pass.length,
        passStartsWithAt: pass.startsWith("@"),
        passEndsWithHash: pass.endsWith("#"),
        hashCountInPass: (pass.match(/#/g) ?? []).length,
        expectedFullPassLength: 14,
        likelyDotenvHashTruncation: pass.length < 14 && !(pass.match(/#/g)?.length),
        configured: Boolean(env.smtpHost && env.smtpUser && pass),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  const mailer = getTransporter();
  if (!mailer) {
    // #region agent log
    fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
      body: JSON.stringify({
        sessionId: "f1fde4",
        runId: "post-fix",
        hypothesisId: "E",
        location: "mailer.ts:sendEmail:no-transporter",
        message: "Transporter null — SMTP env incomplete",
        data: { hasHost: Boolean(env.smtpHost), hasUser: Boolean(env.smtpUser), hasPass: Boolean(env.smtpPass) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
    // #region agent log
    fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
      body: JSON.stringify({
        sessionId: "f1fde4",
        runId: "post-fix",
        hypothesisId: "B",
        location: "mailer.ts:sendEmail:success",
        message: "SMTP sendMail succeeded",
        data: { toDomain: input.to.split("@")[1] ?? "" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return { ok: true };
  } catch (err) {
    const e = err as Error & { code?: string; responseCode?: number; response?: string; command?: string };
    // #region agent log
    fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
      body: JSON.stringify({
        sessionId: "f1fde4",
        runId: "post-fix",
        hypothesisId: "A-B-C",
        location: "mailer.ts:sendEmail:catch",
        message: "SMTP sendMail failed",
        data: {
          code: e.code ?? null,
          responseCode: e.responseCode ?? null,
          command: e.command ?? null,
          responseSnippet: typeof e.response === "string" ? e.response.slice(0, 120) : null,
          errName: e.name,
          passLength: env.smtpPass.length,
          hashCountInPass: (env.smtpPass.match(/#/g) ?? []).length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
