'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SessionUser } from '@/lib/auth';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        console.log('[v0] Auth verified for:', data.user.email);
      } else {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } catch (error) {
      console.error('[v0] Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        console.error('[v0] Login failed with status:', res.status);
        return false;
      }

      const data = await res.json();
      console.log('[v0] Login successful for:', data.user.email);
      
      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', data.token);
      }
      
      setUser(data.user);
      return true;
    } catch (error) {
      console.error('[v0] Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('[v0] Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
