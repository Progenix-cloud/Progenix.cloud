import type { SessionUser } from "./auth";

export function getStoredUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as SessionUser;
  } catch {
    return null;
  }
}

export function getStoredClientId(): string | null {
  const user = getStoredUser();
  return user?.clientId || null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
}

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    if (cookie.startsWith(`${name}=`)) {
      return decodeURIComponent(cookie.slice(name.length + 1));
    }
  }
  return null;
}

export function buildAuthHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const user = getStoredUser();
  if (user?._id) headers.set("x-user-id", user._id);
  const csrf = getCookieValue("csrf_token");
  if (csrf) headers.set("x-csrf-token", csrf);
  return headers;
}
