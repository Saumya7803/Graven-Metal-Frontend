import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../lib/axiosClient';
import {
  AUTH_CHANGED_EVENT,
  clearAuth,
  getAuthToken,
  getAuthUser,
  getDefaultRouteForRole,
  isTokenExpired,
  setAuth,
  type AuthUser,
} from '../../lib/auth';

const SESSION_CHECK_INTERVAL_MS = 30000;

type AuthContextValue = {
  isReady: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: AuthUser | null;
  defaultRoute: string;
};

const AuthContext = createContext<AuthContextValue>({
  isReady: false,
  isAuthenticated: false,
  token: null,
  user: null,
  defaultRoute: '/',
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = getAuthToken();
      const savedUser = getAuthUser();

      if (!savedToken || !savedUser || isTokenExpired(savedToken)) {
        clearAuth();
        setToken(null);
        setUser(null);
        setIsReady(true);
        return;
      }

      // Hydrate instantly for persistence, then verify with backend.
      setToken(savedToken);
      setUser(savedUser);

      try {
        const { data } = await axiosClient.get<{ user: AuthUser }>('/auth/me');
        setAuth(savedToken, data.user);
        setUser(data.user);
      } catch {
        clearAuth();
        setToken(null);
        setUser(null);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      const nextToken = getAuthToken();
      const nextUser = getAuthUser();
      setToken(nextToken);
      setUser(nextUser);
    };

    window.addEventListener(AUTH_CHANGED_EVENT, syncAuthState);
    window.addEventListener('storage', syncAuthState);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  useEffect(() => {
    if (!token || !user) return;

    let cancelled = false;

    const verifySession = async () => {
      if (document.visibilityState === 'hidden') return;
      try {
        const { data } = await axiosClient.get<{ user: AuthUser }>('/auth/me');
        if (cancelled) return;
        setAuth(token, data.user);
        setUser(data.user);
      } catch {
        if (cancelled) return;
        clearAuth();
        setToken(null);
        setUser(null);
      }
    };

    const handleFocus = () => {
      verifySession();
    };

    const intervalId = window.setInterval(verifySession, SESSION_CHECK_INTERVAL_MS);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [token, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated: !!token && !!user,
      token,
      user,
      defaultRoute: getDefaultRouteForRole(user?.role),
    }),
    [isReady, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
