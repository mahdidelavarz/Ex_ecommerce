// src/lib/api-client.ts
import axios from 'axios';
import { useAuthStore } from '@/modules/auth/store/auth.store';
import { getLoginRedirectPath, isPublicRoute, LOGIN_PATH } from '@/lib/public-routes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const redirectToLogin = (): void => {
  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== LOGIN_PATH &&
    !isPublicRoute(window.location.pathname)
  ) {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = getLoginRedirectPath(currentPath);
  }
};

// Shared promise so concurrent 401s share one refresh call instead of each
// firing their own, which causes a storm of refresh requests.
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
            .then(() => undefined)
            .finally(() => { refreshPromise = null; });
        }
        await refreshPromise;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        redirectToLogin();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
