// ============================================================
// Next360 — API Client
// ============================================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiErrorResponse } from '@next360/types';

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokenRefreshed: (accessToken: string, refreshToken: string) => void;
  onAuthError: () => void;
}

/**
 * Create a configured Axios instance for the Next360 API.
 *
 * Features:
 * - Automatic Authorization header injection
 * - Token refresh on 401 responses
 * - Request/response error normalization
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // --- Request interceptor: attach auth token ---
  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      const token = config.getAccessToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // --- Response interceptor: handle 401 + normalize errors ---
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
  }> = [];

  const processQueue = (error: unknown) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(undefined);
      }
    });
    failedQueue = [];
  };

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiErrorResponse>) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

      // If 401 and we haven't retried yet, attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => client(originalRequest));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = config.getRefreshToken();
          if (!refreshToken) {
            config.onAuthError();
            return Promise.reject(error);
          }

          const response = await axios.post<
            ApiResponse<{ accessToken: string; refreshToken: string }>
          >(`${config.baseUrl}/api/v1/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          config.onTokenRefreshed(accessToken, newRefreshToken);

          processQueue(null);
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          config.onAuthError();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Default API client instance — must be initialized before use.
 * For React Native and Next.js, call createApiClient() with platform-specific config.
 */
export let apiClient: AxiosInstance = axios.create();

export function initializeApiClient(config: ApiClientConfig): void {
  apiClient = createApiClient(config);
}
