'use client';

import React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession } from "@/lib/hooks/useAuthSession";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
}: ProtectedRouteProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthSession();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    if (requiredRole && user && !requiredRole.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }
    setIsAuthorized(true);
  }, [loading, isAuthenticated, requiredRole, redirectTo, router, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
