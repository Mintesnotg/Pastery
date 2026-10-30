"use client";

import { Suspense, useEffect, useRef, useState } from "react";
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
  const token = searchParams.get("token") ?? "";
  const next = searchParams.get("next");
  const ran = useRef(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError("Missing verification token. Open the link from your email, or register again.");
      return;
    }
    if (ran.current) return;
    ran.current = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl("/api/auth/verify-email"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error((data as { error?: string }).error || "Verification failed");
        }
        setSuccess((data as { message?: string }).message || "Email verified. Redirecting…");
        router.replace(redirectAfterAuth(next));
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, next, router]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="font-serif text-3xl font-semibold" style={{ color: INK }}>
        Confirm your email
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#6B5A4A]">
        {loading
          ? "Verifying your link…"
          : error
            ? "We could not complete verification."
            : success || "Almost done…"}
      </p>

      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: BROWN }} />
          </div>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {success ? <p className="text-sm text-green-700">{success}</p> : null}
      </div>

      {!loading ? (
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/account?tab=register"
            className="rounded-full py-3.5 text-center text-sm font-semibold text-white"
            style={{ backgroundColor: BROWN }}
          >
            Back to register / resend link
          </Link>
          <Link
            href="/account"
            className="text-center text-sm font-semibold text-[#734F32] underline"
          >
            Sign in
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function VerifyLinkPage() {
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
