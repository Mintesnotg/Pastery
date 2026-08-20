export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const buildApiUrl = (path: string) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};
