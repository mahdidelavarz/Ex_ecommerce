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
  const { setUser, setLoading, setInitialized } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Access token cookie (if any) is sent automatically
        const user = await authService.getMe();
        setUser(user);
      } catch (error) {
        // Access token missing/expired, try to refresh via cookie
        try {
          await authService.refreshToken();
          const user = await authService.getMe();
          setUser(user);
        } catch (refreshError) {
          setUser(null);
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initAuth();
  }, [setUser, setLoading, setInitialized]);

  return <>{children}</>;
}