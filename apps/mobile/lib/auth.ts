import { create } from 'zustand';
import { api, publicApi, loadTokens, saveTokens, clearTokens } from './api';

interface User {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  roles: string[];
  avatarUrl: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

/** Normalizes any phone input to +91XXXXXXXXXX format */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+91') && digits.length === 12) return phone;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (phone.startsWith('+') && digits.length >= 10) return phone;
  return `+91${digits}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    await loadTokens();
    try {
      const res = await api.get('/api/v1/users/me');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false });
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  requestOtp: async (phone: string) => {
    await publicApi.post('/api/v1/auth/otp/request', { phone: normalizePhone(phone) });
  },

  login: async (phone: string, otp: string) => {
    const res = await publicApi.post('/api/v1/auth/otp/verify', { phone: normalizePhone(phone), otp });
    const { accessToken, refreshToken, userProfile } = res.data.data;
    await saveTokens(accessToken, refreshToken);
    set({ user: userProfile, isAuthenticated: true });
  },

  logout: async () => {
    await clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const res = await api.get('/api/v1/users/me');
      set({ user: res.data.data, isAuthenticated: true });
    } catch {}
  },
}));
