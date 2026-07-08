import type { CookieOptions, Response } from 'express';
import { env, isProduction } from '../config/env.js';

/**
 * Auth cookie helpers.
 *
 * - `refresh_token` is httpOnly (never exposed to JS) and scoped to the auth
 *   path so it is only sent where it is needed.
 * - `csrf_token` is readable by the client so it can echo it back in a header
 *   (double-submit-cookie CSRF defense).
 *
 * Both are `SameSite=Strict` and `Secure` in production.
 */
export const REFRESH_COOKIE = 'refresh_token';
export const CSRF_COOKIE = 'csrf_token';
export const AUTH_COOKIE_PATH = '/api/v1/auth';

function baseCookieOptions(): CookieOptions {
  return {
    domain: env.COOKIE_DOMAIN,
    path: AUTH_COOKIE_PATH,
    sameSite: 'strict',
    secure: isProduction,
    maxAge: env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function setAuthCookies(res: Response, refreshToken: string, csrfToken: string): void {
  const base = baseCookieOptions();
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, httpOnly: true });
  res.cookie(CSRF_COOKIE, csrfToken, { ...base, httpOnly: false });
}

export function clearAuthCookies(res: Response): void {
  const options: CookieOptions = {
    domain: env.COOKIE_DOMAIN,
    path: AUTH_COOKIE_PATH,
    sameSite: 'strict',
    secure: isProduction,
  };
  res.clearCookie(REFRESH_COOKIE, { ...options, httpOnly: true });
  res.clearCookie(CSRF_COOKIE, { ...options, httpOnly: false });
}
