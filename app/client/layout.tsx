"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientSidebar } from "@/components/client/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useAuthSession } from "@/lib/hooks/useAuthSession";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthSession();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== "client") {
      router.push("/admin/dashboard");
      return;
    }
    setIsAuthorized(true);
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <ClientSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
