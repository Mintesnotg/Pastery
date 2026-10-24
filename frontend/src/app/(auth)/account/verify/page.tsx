"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

const BROWN = "#734F32";
const INK = "#3F2A18";

function redirectAfterAuth(next?: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard/place-order";
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = useMemo(
    () => (searchParams.get("email") ?? "").trim().toLowerCase(),
    [searchParams],
  );
  const next = searchParams.get("next");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Missing email. Go back and sign up or sign in again.");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/auth/verify-otp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Verification failed");
      }
      setSuccess("Email verified. Redirecting…");
      router.replace(redirectAfterAuth(next));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Missing email. Go back and sign up or sign in again.");
      return;
    }
    setResending(true);
    try {
      const res = await fetch(apiUrl("/api/auth/resend-verification"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Could not resend code");
      }
      setSuccess((data as { message?: string }).message || "Verification code sent.");
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>
        Enter verification code
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6B5A4A]">
        {email ? (
          <>
            We sent a 6-digit code to <span className="font-medium text-[#3F2A18]">{email}</span>.
            It expires in 30 minutes.
          </>
        ) : (
          <>Missing email. Return to the account page to continue.</>
        )}
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-4">
        <label className="block text-left text-sm font-medium" style={{ color: INK }}>
          6-digit code
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-2 w-full rounded-xl border border-[#E6D9CB] bg-white px-4 py-3 text-center text-2xl tracking-[0.35em] text-[#3F2A18] outline-none focus:border-[#734F32]"
            placeholder="000000"
            disabled={loading || !email}
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}

        <button
          type="submit"
          disabled={loading || !email}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60"
          style={{ backgroundColor: BROWN }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Verifying…" : "Verify and continue"}
        </button>
      </form>

      <button
        type="button"
        disabled={resending || !email}
        onClick={() => void resend()}
        className="mt-4 w-full cursor-pointer rounded-full border border-[#E6D9CB] bg-[#FFF8F3] px-4 py-2.5 text-sm font-medium text-[#734F32] transition hover:bg-[#FDEBDD] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resending ? "Sending…" : "Resend code"}
      </button>

      <Link href="/account" className="mt-8 text-center text-sm font-semibold text-[#734F32] underline">
        Back to account
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
