import { useState, useEffect } from "react";
import type { SessionUser } from "../auth";
import { getStoredToken } from "../client-auth";

export function useAuthSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = getStoredToken();
        if (!storedToken) {
          setError("No token found");
          setLoading(false);
          return;
        }
        setToken(storedToken);

        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: storedToken }),
        });

        if (!response.ok) {
          // try refresh once
          const refreshed = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
          if (refreshed.ok) {
            const refreshedData = await refreshed.json();
            const refreshedPayload = refreshedData?.data || {};
            if (refreshedPayload?.token) {
              localStorage.setItem("authToken", refreshedPayload.token);
              setToken(refreshedPayload.token);
            }
            if (refreshedPayload?.user) {
              localStorage.setItem("user", JSON.stringify(refreshedPayload.user));
              setUser(refreshedPayload.user);
              setLoading(false);
              return;
            }
          }

          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          setError("Invalid token");
          setLoading(false);
          return;
        }

        const data = await response.json();
        const payload = data?.data || {};
        if (data.success && payload.user) {
          setUser(payload.user);
          localStorage.setItem("user", JSON.stringify(payload.user));
        } else {
          setError("Verification failed");
        }
      } catch (err) {
        setError("Auth check failed");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = async () => {
    const storedToken = getStoredToken();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: storedToken }),
      });
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
    window.location.href = "/auth/login";
  };

  const hasRole = (requiredRoles: string[]) => {
    return user && requiredRoles.includes(user.role);
  };

  const isAdminRole = () => {
    return ["admin", "project_manager", "business_head"].includes(
      user?.role || ""
    );
  };

  return {
    user,
    token,
    loading,
    error,
    logout,
    hasRole,
    isAdminRole,
    isAuthenticated: !!user,
  };
}

export const ROLES = {
  ADMIN: "admin" as const,
  PROJECT_MANAGER: "project_manager" as const,
  BUSINESS_HEAD: "business_head" as const,
  LEAD_ARCHITECT: "lead_architect" as const,
  DEVELOPER: "developer" as const,
  CLIENT: "client" as const,
} as const;
