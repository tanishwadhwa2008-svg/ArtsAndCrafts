import { SignJWT, jwtVerify } from 'jose';
import type { Role } from '@arts/shared';
import { env } from '../config/env.js';

/**
 * Access-token signing & verification (self-managed JWT, HS256).
 *
 * Access tokens are short-lived and stateless — they are verified on every
 * request without a database lookup. Longer-lived, revocable refresh tokens
 * are handled separately (see `refresh-token.ts`).
 */
const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

const ISSUER = 'arts-api';
const AUDIENCE = 'arts-seller';

export interface AccessTokenClaims {
  sub: string;
  role: Role;
  shopId: string | null;
  email: string;
}

export async function signAccessToken(claims: AccessTokenClaims): Promise<string> {
  return new SignJWT({ role: claims.role, shopId: claims.shopId, email: claims.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { payload } = await jwtVerify(token, accessSecret, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  return {
    sub: String(payload.sub),
    role: payload.role as Role,
    shopId: (payload.shopId as string | null) ?? null,
    email: String(payload.email),
  };
}
