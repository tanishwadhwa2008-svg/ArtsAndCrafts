import type { User } from '@prisma/client';
import type { ForgotPasswordInput, LoginInput, RegisterInput } from '@arts/shared';
import { prisma } from '../../db/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { ConflictError, UnauthorizedError } from '../../lib/errors.js';
import { hashPassword, verifyPassword } from '../../lib/password.js';
import { signAccessToken } from '../../lib/jwt.js';
import {
  generateCsrfToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../../lib/refresh-token.js';
import type { AuthResult, AuthTokens, AuthUser } from './auth.types.js';

const REFRESH_TTL_MS = env.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000;

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    shopId: user.shopId,
    displayName: user.displayName,
  };
}

/**
 * Best-effort audit trail (OWASP A09). Never let an audit failure break the
 * primary request.
 */
async function writeAudit(
  action: string,
  userId: string | null,
  ip?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { action, userId, ipAddress: ip, metadata: metadata as object | undefined },
    });
  } catch (error) {
    logger.warn({ err: error, action }, 'Failed to write audit log');
  }
}

async function issueTokens(user: User, ip?: string): Promise<AuthTokens> {
  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    shopId: user.shopId,
    email: user.email,
  });

  const { token, tokenHash } = generateRefreshToken();
  const csrfToken = generateCsrfToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      createdByIp: ip,
    },
  });

  return { accessToken, refreshToken: token, csrfToken };
}

export async function register(input: RegisterInput, ip?: string): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      role: 'SELLER',
    },
  });

  await writeAudit('auth.register', user.id, ip);
  const tokens = await issueTokens(user, ip);
  return { user: toAuthUser(user), tokens };
}

export async function login(input: LoginInput, ip?: string): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  // Generic error to avoid user enumeration (OWASP A07).
  const invalid = new UnauthorizedError('Invalid email or password');

  if (!user || !user.passwordHash || !user.isActive) {
    await writeAudit('auth.login_failed', user?.id ?? null, ip, { email: input.email });
    throw invalid;
  }

  const ok = await verifyPassword(user.passwordHash, input.password);
  if (!ok) {
    await writeAudit('auth.login_failed', user.id, ip);
    throw invalid;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await writeAudit('auth.login', user.id, ip);

  const tokens = await issueTokens(user, ip);
  return { user: toAuthUser(user), tokens };
}

export async function refresh(rawToken: string | undefined, ip?: string): Promise<AuthResult> {
  if (!rawToken) {
    throw new UnauthorizedError('Missing refresh token');
  }

  const tokenHash = hashRefreshToken(rawToken);
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  // Reuse detection: a revoked token being presented again implies theft.
  // Invalidate the entire token family for the user.
  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await writeAudit('auth.token_reuse_detected', record.userId, ip);
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  if (record.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired');
  }

  const user = record.user;
  if (!user.isActive) {
    throw new UnauthorizedError('Account is disabled');
  }

  // Rotate: issue a new token and revoke the presented one atomically.
  const rotated = generateRefreshToken();
  const csrfToken = generateCsrfToken();

  await prisma.$transaction([
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: rotated.tokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        createdByIp: ip,
      },
    }),
    prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date(), replacedByToken: rotated.tokenHash },
    }),
  ]);

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    shopId: user.shopId,
    email: user.email,
  });

  return {
    user: toAuthUser(user),
    tokens: { accessToken, refreshToken: rotated.token, csrfToken },
  };
}

export async function logout(
  rawToken: string | undefined,
  userId?: string,
  ip?: string,
): Promise<void> {
  if (rawToken) {
    const tokenHash = hashRefreshToken(rawToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  if (userId) {
    await writeAudit('auth.logout', userId, ip);
  }
}

/**
 * Password-reset request. Intentionally does not reveal whether the email
 * exists (OWASP A07). Actual email delivery/token issuance is wired up in a
 * later phase; for now the request is audited and always succeeds.
 */
export async function requestPasswordReset(input: ForgotPasswordInput, ip?: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (user) {
    await writeAudit('auth.password_reset_requested', user.id, ip);
  }
}
