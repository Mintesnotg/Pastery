const SESSION_STORAGE_KEY = "hob.session";

/** Absolute backend URL (SSR / server). Browser uses same-origin paths via Next rewrites. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export function apiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Client: hit this site's /api so rewrite + first-party Set-Cookie work.
  if (typeof window !== "undefined") {
    return normalized;
  }
  return `${API_BASE_URL.replace(/\/+$/, "")}${normalized}`;
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  } catch {
    /* private mode / quota */
  }
}

export function clearSessionToken() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Merge credentials + Bearer (fallback when cross-site cookie is blocked). */
export function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers ?? {});
  const token = getSessionToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return { ...init, headers, credentials: init.credentials ?? "include" };
}

export function withPermission(permission: string, init: RequestInit = {}): RequestInit {
  const authed = withAuth(init);
  const headers = new Headers(authed.headers);
  headers.set("Permission", permission);
  return { ...authed, headers };
}

export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), withAuth(init));
}

export const buildApiUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
