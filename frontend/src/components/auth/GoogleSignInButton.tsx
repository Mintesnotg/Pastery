"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (el: HTMLElement, config: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

type Props = {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
};

export function GoogleSignInButton({ onCredential, disabled }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  const init = useCallback(() => {
    if (!clientId || !btnRef.current || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) void onCredential(response.credential);
      },
      ux_mode: "popup",
    });
    btnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
      shape: "pill",
    });
    setReady(true);
  }, [clientId, onCredential]);

  useEffect(() => {
    if (window.google?.accounts?.id) init();
  }, [init]);

  if (!clientId) {
    return (
      <p className="text-center text-xs text-[#9A8573]">
        Google sign-in is not configured (missing NEXT_PUBLIC_GOOGLE_CLIENT_ID).
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => init()}
        onError={() => setScriptError("Failed to load Google sign-in")}
      />
      <div className="flex flex-col items-center gap-2">
        <div
          ref={btnRef}
          className={disabled ? "pointer-events-none opacity-50" : ""}
          aria-busy={!ready}
        />
        {scriptError ? <p className="text-xs text-red-600">{scriptError}</p> : null}
      </div>
    </>
  );
}
