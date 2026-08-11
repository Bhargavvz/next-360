import { createApiClient } from '@next360/api-client';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8080';

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
