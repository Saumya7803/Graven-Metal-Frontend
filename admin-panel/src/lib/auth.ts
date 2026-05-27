export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
};

export const AUTH_CHANGED_EVENT = 'graven:auth-changed';

type JwtPayload = {
  id?: string;
  role?: string;
  exp?: number;
  iat?: number;
  permissions?: string[];
};

export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

export function setAuth(token: string, user: AuthUser) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function clearAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem('auth_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return Date.now() >= Number(payload.exp) * 1000;
}

export function getDefaultRouteForRole(role?: string) {
  if (role === 'super_admin') return '/super-admin';
  if (role === 'admin' || role === 'editor') return '/admin';
  return '/';
}
