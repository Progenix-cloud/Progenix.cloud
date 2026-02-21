'use client';

import React from "react"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientSidebar } from '@/components/client/sidebar';
import { ClientHeader } from '@/components/client/header';
import { Spinner } from '@/components/ui/spinner';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          router.push('/auth/login');
          return;
        }

        const user = JSON.parse(userStr);

        // Check if user is client
        if (user.role !== 'client') {
          router.push('/admin/dashboard');
          return;
        }

        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setIsAuthorized(true);
        } else {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [router]);

  if (isLoading) {
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
        <ClientHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
