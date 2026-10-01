"use client";

import { useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
  id: number;
} | null;

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastState;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-60 flex items-center gap-3 rounded-xl px-4 py-3 text-white shadow-lg transition-all ${
        toast.type === "success" ? "bg-crust" : "bg-red-600"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="ml-1 hover:opacity-70"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

let _id = 0;

export function useToast() {
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ message, type, id: ++_id });
  }, []);

  const dismiss = useCallback(() => setToast(null), []);

  return { toast, showToast, dismiss };
}
