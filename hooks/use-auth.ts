'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'project_manager' | 'business_head' | 'lead_architect' | 'developer' | 'client';
  avatar: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userCookie = document.cookie
          .split('; ')
          .find((row) => row.startsWith('user='))
          ?.split('=')[1];

        if (!userCookie) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
      } catch (err) {
        setError('Failed to verify authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  return { user, loading, error, logout, isAuthenticated: !!user };
}
