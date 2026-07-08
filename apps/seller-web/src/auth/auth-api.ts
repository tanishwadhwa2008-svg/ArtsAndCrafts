import { apiRequest, refreshSession, setAuthTokens, hasPersistedSession } from '../lib/api.js';

export interface SellerUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'SELLER' | 'CUSTOMER' | 'WHOLESALE';
  shopId: string | null;
  displayName: string | null;
}

interface AuthTokenPayload {
  user: SellerUser;
  accessToken: string;
  csrfToken: string;
}

export async function login(email: string, password: string): Promise<SellerUser> {
  const data = await apiRequest<AuthTokenPayload>('/auth/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });
  setAuthTokens(data.accessToken, data.csrfToken);
  return data.user;
}

export async function fetchCurrentUser(): Promise<SellerUser> {
  const data = await apiRequest<{ user: SellerUser }>('/auth/me');
  return data.user;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>('/auth/logout', { method: 'POST', csrf: true });
  } finally {
    setAuthTokens(null, null);
  }
}

/** Attempts to restore a session on load via the refresh cookie. */
export async function restoreSession(): Promise<SellerUser | null> {
  if (!hasPersistedSession()) return null;
  const ok = await refreshSession();
  if (!ok) return null;
  try {
    return await fetchCurrentUser();
  } catch {
    return null;
  }
}
