'use client';

import { createApiClient } from '@next360/api-client';
import axios from 'axios';

/**
 * Every call in this app is written with the full `/api/v1/...` path, so the base URL
 * must be the server origin only. NEXT_PUBLIC_API_URL is commonly set to
 * `http://localhost:8080/api/v1`, which would produce `/api/v1/api/v1/...` and 404 on
 * every request — strip the suffix and any trailing slash so either form works.
 */
function normalizeBaseUrl(raw: string): string {
  return raw.replace(/\/+$/, '').replace(/\/api\/v\d+$/, '');
}

const API_BASE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
);

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('next360_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('next360_refresh_token');
}

function onTokenRefreshed(accessToken: string, refreshToken: string) {
  localStorage.setItem('next360_access_token', accessToken);
  localStorage.setItem('next360_refresh_token', refreshToken);
}

function onAuthError() {
  localStorage.removeItem('next360_access_token');
  localStorage.removeItem('next360_refresh_token');
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }
}

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  getAccessToken,
  getRefreshToken,
  onTokenRefreshed,
  onAuthError,
});

// Public client (no auth)
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Pull a human-readable message out of an API error.
 *
 * The backend wraps failures as `{ success: false, message, error: { code, message,
 * details } }`, where `details` holds per-field validation messages. Reading only
 * `data.message` misses field errors, so prefer the most specific thing available.
 */
export function apiErrorMessage(err: any, fallback = 'Something went wrong'): string {
  const data = err?.response?.data;
  const details = data?.error?.details ?? data?.errors;

  if (details && typeof details === 'object') {
    const messages = Object.values(details).filter(
      (v): v is string => typeof v === 'string' && v.length > 0
    );
    if (messages.length > 0) return messages.join('. ');
  }

  return data?.error?.message || data?.message || err?.message || fallback;
}
