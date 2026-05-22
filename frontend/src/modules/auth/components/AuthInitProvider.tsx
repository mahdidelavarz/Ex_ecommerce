// src/modules/auth/components/AuthInitProvider.tsx
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export default function AuthInitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setUser, setLoading, refreshToken } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        // Try to get current user with existing cookie
        const user = await authService.getMe();
        setUser(user);
      } catch (error) {
        // Token might be expired, try to refresh
        try {
          await authService.refreshToken(refreshToken);
          const user = await authService.getMe();
          setUser(user);
        } catch (refreshError) {
          // Both tokens expired, clear auth
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshToken, setUser, setLoading]);

  return <>{children}</>;
}