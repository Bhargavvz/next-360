'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, publicApi } from './api';

interface User {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  roles: string[];
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, otp: string) => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Normalizes any phone input to +91XXXXXXXXXX format */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+91') && digits.length === 12) return phone;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (phone.startsWith('+') && digits.length >= 10) return phone;
  return `+91${digits}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/users/me');
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('next360_access_token');
      localStorage.removeItem('next360_refresh_token');
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('next360_access_token');
    if (token) {
      fetchUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const requestOtp = useCallback(async (phone: string) => {
    await publicApi.post('/api/v1/auth/otp/request', { phone: normalizePhone(phone) });
  }, []);

  const login = useCallback(async (phone: string, otp: string) => {
    const res = await publicApi.post('/api/v1/auth/otp/verify', { phone: normalizePhone(phone), otp });
    const { accessToken, refreshToken, userProfile } = res.data.data;
    localStorage.setItem('next360_access_token', accessToken);
    localStorage.setItem('next360_refresh_token', refreshToken);
    setUser(userProfile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('next360_access_token');
    localStorage.removeItem('next360_refresh_token');
    setUser(null);
    window.location.href = '/';
  }, []);

  /**
   * Rotates the JWT token using the refresh token, then re-fetches the user profile.
   * Must be called after any role change (e.g. seller registration) so the new
   * access token carries the updated roles and Spring Security stops returning 403.
   */
  const refreshUser = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('next360_refresh_token');
    if (storedRefreshToken) {
      try {
        // Get a fresh token pair — new accessToken will have updated roles
        const res = await publicApi.post('/api/v1/auth/refresh', { refreshToken: storedRefreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        localStorage.setItem('next360_access_token', accessToken);
        localStorage.setItem('next360_refresh_token', newRefreshToken);
      } catch {
        // Refresh token may have expired — just re-fetch profile with existing token
      }
    }
    await fetchUser();
  }, [fetchUser]);

  const hasRole = useCallback((role: string) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, requestOtp, logout, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
