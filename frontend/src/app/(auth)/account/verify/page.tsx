"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

function redirectAfterAuth(next?: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard/place-order";
}

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    const token = searchParams.get("token");
    const next = searchParams.get("next");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          apiUrl(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
          { credentials: "include" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || "Verification failed");
        }
        if (cancelled) return;
        setStatus("ok");
        setMessage("Email verified. Redirecting…");
        router.replace(redirectAfterAuth(next));
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage((err as Error).message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      {status === "working" ? (
        <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" aria-label="Verifying" />
      ) : null}
      <p className="mt-4 text-base text-[#3F2A18]">{message}</p>
      {status === "error" ? (
        <Link href="/account" className="mt-6 text-sm font-semibold text-[#734F32] underline">
          Back to account
        </Link>
      ) : null}
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
