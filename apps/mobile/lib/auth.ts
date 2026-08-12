import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
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
  hasSeenOnboarding: boolean;
  initialize: () => Promise<void>;
  setHasSeenOnboarding: () => Promise<void>;
  requestOtp: (phone: string) => Promise<void>;
  login: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+91') && digits.length === 12) return phone;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (phone.startsWith('+') && digits.length >= 10) return phone;
  return `+91${digits}`;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasSeenOnboarding: false,

  initialize: async () => {
    let hasSeen = false;
    try {
      const stored = await SecureStore.getItemAsync('hasSeenOnboarding');
      if (stored === 'true') hasSeen = true;
    } catch {}

    await loadTokens();
    try {
      const res = await api.get('/api/v1/users/me');
      set({ user: res.data.data, isAuthenticated: true, isLoading: false, hasSeenOnboarding: hasSeen });
    } catch {
      await clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, hasSeenOnboarding: hasSeen });
    }
  },

  setHasSeenOnboarding: async () => {
    try {
      await SecureStore.setItemAsync('hasSeenOnboarding', 'true');
      set({ hasSeenOnboarding: true });
    } catch {}
  },

  requestOtp: async (phone: string) => {
    await publicApi.post('/api/v1/auth/otp/request', { phone: normalizePhone(phone) });
  },

  login: async (phone: string, otp: string) => {
    const res = await publicApi.post('/api/v1/auth/otp/verify', {
      phone: normalizePhone(phone),
      otp,
    });
    const { accessToken, refreshToken, userProfile } = res.data.data;
    await saveTokens(accessToken, refreshToken);
    set({ user: userProfile, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post('/api/v1/auth/logout').catch(() => {});
    } finally {
      await clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },

  /**
   * Rotate the JWT first (to pick up new roles like SELLER),
   * then re-fetch the user profile.
   */
  refreshUser: async () => {
    try {
      // Rotate token so new roles are included
      const refreshRes = await api.post('/api/v1/auth/refresh');
      if (refreshRes.data?.data?.accessToken) {
        await saveTokens(refreshRes.data.data.accessToken, refreshRes.data.data.refreshToken);
      }
    } catch {}
    try {
      const res = await api.get('/api/v1/users/me');
      set({ user: res.data.data, isAuthenticated: true });
    } catch {}
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    return user.roles.some(
      (r) => r === role || r === `ROLE_${role}` || r.replace('ROLE_', '') === role
    );
  },
}));
