import { createApiClient } from '@next360/api-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

/**
 * Calls in this app use full `/api/v1/...` paths, so the base URL must be the origin
 * only. Strip a trailing `/api/v1` (and any trailing slash) so a config value copied
 * from the web app's NEXT_PUBLIC_API_URL does not produce `/api/v1/api/v1/...`.
 */
function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '').replace(/\/api\/v\d+$/, '');
}

/**
 * Resolution order:
 *   1. EXPO_PUBLIC_API_URL   — per-developer override, and what EAS build profiles set
 *   2. app.json extra.apiUrl — the committed default
 *   3. localhost             — last resort
 *
 * A physical device cannot reach `localhost`, so when testing on hardware set
 * EXPO_PUBLIC_API_URL to your machine's LAN address (e.g. http://192.168.1.17:8080).
 */
const API_BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.apiUrl ||
    'http://localhost:8080'
);

// Cross-platform secure storage helper (SecureStore on iOS/Android, localStorage on Web)
async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined') {
        g.localStorage.setItem(key, value);
      }
    } catch {}
  } else {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  }
}

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined') {
        return g.localStorage.getItem(key);
      }
      return null;
    } catch {
      return null;
    }
  } else {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  }
}

async function deleteStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      const g = globalThis as any;
      if (typeof g.localStorage !== 'undefined') {
        g.localStorage.removeItem(key);
      }
    } catch {}
  } else {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  }
}

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;

/** Current access token, used to decide whether a session exists at all. */
export function getAccessToken(): string | null {
  return cachedAccessToken;
}

/** Current refresh token, for calls that must send it in the request body. */
export function getRefreshToken(): string | null {
  return cachedRefreshToken;
}

export async function loadTokens() {
  cachedAccessToken = await getStorageItem('next360_access_token');
  cachedRefreshToken = await getStorageItem('next360_refresh_token');
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  cachedAccessToken = accessToken;
  cachedRefreshToken = refreshToken;
  await setStorageItem('next360_access_token', accessToken);
  await setStorageItem('next360_refresh_token', refreshToken);
}

export async function clearTokens() {
  cachedAccessToken = null;
  cachedRefreshToken = null;
  await deleteStorageItem('next360_access_token');
  await deleteStorageItem('next360_refresh_token');
}

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken: () => cachedAccessToken,
  getRefreshToken: () => cachedRefreshToken,
  onTokenRefreshed: (accessToken: string, refreshToken: string) => {
    saveTokens(accessToken, refreshToken);
  },
  onAuthError: () => {
    clearTokens();
  },
});

export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Pull a human-readable message out of an API error.
 *
 * Failures come back as `{ success: false, message, error: { code, message, details } }`
 * where `details` holds per-field validation messages — prefer the most specific one.
 */
export function apiErrorMessage(err: any, fallback = 'Something went wrong'): string {
  const data = err?.response?.data;
  const details = data?.error?.details ?? data?.errors;

  if (details && typeof details === 'object') {
    const messages = Object.values(details).filter(
      (v): v is string => typeof v === 'string' && v.length > 0
    );
    if (messages.length > 0) return messages.join('\n');
  }

  return data?.error?.message || data?.message || err?.message || fallback;
}
