"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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

/** GSI allows only one initialize(); share it across mounts. */
let gsiInitializedForClientId: string | null = null;
let gsiCredentialHandler: ((idToken: string) => void) | null = null;

function ensureGsiInitialized(clientId: string) {
  if (!window.google?.accounts?.id) return false;
  if (gsiInitializedForClientId === clientId) return true;
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: { credential?: string }) => {
      if (response.credential) gsiCredentialHandler?.(response.credential);
    },
    ux_mode: "popup",
  });
  gsiInitializedForClientId = clientId;
  return true;
}

export function GoogleSignInButton({ onCredential, disabled }: Props) {
  const btnRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [scriptError, setScriptError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const instanceId = useRef(`gsi-${Math.random().toString(36).slice(2, 8)}`);
  const initCountRef = useRef(0);

  useEffect(() => {
    gsiCredentialHandler = (token) => {
      void onCredential(token);
    };
  }, [onCredential]);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
      body: JSON.stringify({
        sessionId: "f1fde4",
        runId: "post-fix",
        hypothesisId: "A-D",
        location: "GoogleSignInButton.tsx:mount",
        message: "GoogleSignInButton mounted",
        data: { instanceId: instanceId.current },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    return () => {
      fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
        body: JSON.stringify({
          sessionId: "f1fde4",
          runId: "post-fix",
          hypothesisId: "A-D",
          location: "GoogleSignInButton.tsx:unmount",
          message: "GoogleSignInButton unmounted",
          data: { instanceId: instanceId.current },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };
  }, []);
  // #endregion

  const setupButton = (source: "effect" | "script") => {
    if (!clientId || !btnRef.current || !window.google?.accounts?.id) return;
    const didInit = gsiInitializedForClientId !== clientId;
    if (!ensureGsiInitialized(clientId)) return;

    initCountRef.current += 1;
    // #region agent log
    fetch("http://127.0.0.1:7277/ingest/8fd3327a-15d9-4b20-bdf5-fb2bcccb11ac", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f1fde4" },
      body: JSON.stringify({
        sessionId: "f1fde4",
        runId: "post-fix",
        hypothesisId: "A-B-C-E",
        location: "GoogleSignInButton.tsx:setupButton",
        message: "GSI setupButton",
        data: {
          instanceId: instanceId.current,
          source,
          setupCount: initCountRef.current,
          calledInitialize: didInit,
          alreadyRendered: renderedRef.current,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (renderedRef.current) return;
    btnRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(btnRef.current, {
      theme: "outline",
      size: "large",
      width: 360,
      text: "continue_with",
      shape: "pill",
    });
    renderedRef.current = true;
    setReady(true);
  };

  useEffect(() => {
    setupButton("effect");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setup once when script/client ready; credential via module handler
  }, [clientId]);

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
        onLoad={() => setupButton("script")}
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
