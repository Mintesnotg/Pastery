"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

/** Legacy OTP route — forward to link-based /verify when possible. */
function RedirectInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const next = searchParams.get("next");
    const qs = new URLSearchParams();
    if (token) qs.set("token", token);
    if (next) qs.set("next", next);
    const suffix = qs.toString() ? `?${qs}` : "";
    router.replace(`/verify${suffix}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" />
    </div>
  );
}

export default function LegacyVerifyRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#734F32]" />
        </div>
      }
    >
      <RedirectInner />
    </Suspense>
  );
}
