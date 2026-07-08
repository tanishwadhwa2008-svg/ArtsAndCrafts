import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Refresh-token primitives.
 *
 * Refresh tokens are opaque random strings. Only an HMAC of the token is
 * stored in the database (keyed with a server secret / "pepper"), so a
 * database leak alone cannot be used to forge sessions. Rotation and reuse
 * detection are handled in the auth service.
 */
export function generateRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(48).toString('base64url');
  return { token, tokenHash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHmac('sha256', env.JWT_REFRESH_SECRET).update(token).digest('hex');
}

/** CSRF token for the double-submit-cookie defense on cookie-auth endpoints. */
export function generateCsrfToken(): string {
  return randomBytes(24).toString('base64url');
}

/** Constant-time string comparison to avoid timing side channels. */
export function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) {
    return false;
  }
  return timingSafeEqual(bufferA, bufferB);
}
