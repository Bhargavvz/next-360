import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api, publicApi, loadTokens, saveTokens, clearTokens, getRefreshToken, getAccessToken } from './api';

interface User {
  id: string;
  name: string | null;
  phone: string;
  email: string | null;
  roles: string[];
  avatarUrl: string | null;
}

/** Challenge metadata returned by POST /auth/otp/request. */
export interface OtpChallenge {
  phone: string;
  expiresIn: number;
  resendIn: number;
  devMode: boolean;
  devOtp?: string | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  initialize: () => Promise<void>;
  setHasSeenOnboarding: () => Promise<void>;
  requestOtp: (phone: string) => Promise<OtpChallenge>;
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

    // No stored session — skip the profile call entirely. Making it anyway meant
    // every cold start for a signed-out user paid a round trip, a guaranteed 401
    // and a refresh attempt before the first screen could render.
    if (!getRefreshToken() && !getAccessToken()) {
      set({ user: null, isAuthenticated: false, isLoading: false, hasSeenOnboarding: hasSeen });
      return;
    }

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

  requestOtp: async (phone: string): Promise<OtpChallenge> => {
    const res = await publicApi.post('/api/v1/auth/otp/request', { phone: normalizePhone(phone) });
    return res.data.data as OtpChallenge;
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
    // The endpoint needs the refresh token in the body to revoke it server-side;
    // calling it bare left the token valid for its full lifetime.
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await publicApi.post('/api/v1/auth/logout', { refreshToken }).catch(() => {});
      }
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
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        // Rotate the token so newly granted roles are included in its claims.
        const refreshRes = await publicApi.post('/api/v1/auth/refresh', { refreshToken });
        const data = refreshRes.data?.data;
        if (data?.accessToken) {
          await saveTokens(data.accessToken, data.refreshToken);
        }
      } catch {
        // Refresh token may have expired — fall through and try the existing access token.
      }
    }
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
