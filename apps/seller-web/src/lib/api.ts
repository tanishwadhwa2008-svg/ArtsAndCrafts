import type { ApiResponse } from '@arts/shared';

/**
 * Typed API client for the seller portal.
 *
 * - Access token is kept in memory only (never in storage) to limit XSS blast
 *   radius; it is restored via a silent refresh on load.
 * - The CSRF token (not secret) is persisted so a page reload can perform the
 *   cookie-authenticated refresh.
 * - Refreshes are single-flighted and retried once on a 401.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const CSRF_STORAGE_KEY = 'arts.csrf';

let accessToken: string | null = null;
let csrfToken: string | null = localStorage.getItem(CSRF_STORAGE_KEY);

export function setAuthTokens(access: string | null, csrf?: string | null): void {
  accessToken = access;
  if (csrf !== undefined) {
    csrfToken = csrf;
    if (csrf) localStorage.setItem(CSRF_STORAGE_KEY, csrf);
    else localStorage.removeItem(CSRF_STORAGE_KEY);
  }
}

export function hasPersistedSession(): boolean {
  return Boolean(csrfToken);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  /** Attach the access token (default true). */
  auth?: boolean;
  /** Attach the CSRF header (for cookie-authenticated endpoints). */
  csrf?: boolean;
  _retry?: boolean;
}

async function rawRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, csrf = false } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (csrf && csrfToken) headers['x-csrf-token'] = csrfToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
  if (!res.ok || !json || !json.ok) {
    const error = json && !json.ok ? json.error : { code: 'NETWORK', message: 'Request failed' };
    throw new ApiError(res.status, error.code, error.message, error.details);
  }
  return json.data;
}

interface AuthTokenResponse {
  user: unknown;
  accessToken: string;
  csrfToken: string;
}

let refreshPromise: Promise<boolean> | null = null;

export async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = rawRequest<AuthTokenResponse>('/auth/refresh', {
      method: 'POST',
      auth: false,
      csrf: true,
    })
      .then((data) => {
        setAuthTokens(data.accessToken, data.csrfToken);
        return true;
      })
      .catch(() => {
        setAuthTokens(null, null);
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, opts);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && opts.auth !== false && !opts._retry) {
      const ok = await refreshSession();
      if (ok) return rawRequest<T>(path, { ...opts, _retry: true });
    }
    throw error;
  }
}
