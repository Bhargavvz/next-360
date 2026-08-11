'use client';

import { createApiClient } from '@next360/api-client';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
