"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PlaceOrderRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/order");
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gray-500" aria-label="Redirecting to order page" />
    </div>
  );
}
