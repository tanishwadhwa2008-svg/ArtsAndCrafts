import type { Request, Response } from 'express';
import type { ForgotPasswordInput, LoginInput, RegisterInput, ApiSuccess } from '@arts/shared';
import { prisma } from '../../db/prisma.js';
import { NotFoundError } from '../../lib/errors.js';
import { REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from '../../lib/cookies.js';
import type { AuthResult, AuthUser } from './auth.types.js';
import * as authService from './auth.service.js';

/** Shapes the client-facing auth payload: user, access token, and the CSRF
 * token (not secret) so an SPA can echo it on cookie-authenticated calls. */
function authPayload(
  result: AuthResult,
): ApiSuccess<{ user: AuthUser; accessToken: string; csrfToken: string }> {
  return {
    ok: true,
    data: {
      user: result.user,
      accessToken: result.tokens.accessToken,
      csrfToken: result.tokens.csrfToken,
    },
  };
}

function readRefreshCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_COOKIE] as string | undefined;
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const input = req.validated.body as RegisterInput;
  const result = await authService.register(input, req.ip);
  setAuthCookies(res, result.tokens.refreshToken, result.tokens.csrfToken);
  res.status(201).json(authPayload(result));
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = req.validated.body as LoginInput;
  const result = await authService.login(input, req.ip);
  setAuthCookies(res, result.tokens.refreshToken, result.tokens.csrfToken);
  res.status(200).json(authPayload(result));
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const result = await authService.refresh(readRefreshCookie(req), req.ip);
  setAuthCookies(res, result.tokens.refreshToken, result.tokens.csrfToken);
  res.status(200).json(authPayload(result));
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  await authService.logout(readRefreshCookie(req), req.user?.id, req.ip);
  clearAuthCookies(res);
  res.status(204).send();
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, shopId: true, displayName: true },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const body: ApiSuccess<{ user: AuthUser }> = { ok: true, data: { user } };
  res.status(200).json(body);
}

export async function forgotPasswordHandler(req: Request, res: Response): Promise<void> {
  const input = req.validated.body as ForgotPasswordInput;
  await authService.requestPasswordReset(input, req.ip);
  // Always succeed to avoid revealing whether the email exists.
  const body: ApiSuccess<{ message: string }> = {
    ok: true,
    data: { message: 'If an account exists, password reset instructions have been sent.' },
  };
  res.status(200).json(body);
}
