import type { RequestHandler } from 'express';
import { UnauthorizedError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { asyncHandler } from './async-handler.js';

/**
 * Authenticates a request via a Bearer access token. On success, attaches the
 * decoded principal to `req.user`. Stateless — no database lookup required.
 */
export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header');
  }

  const token = header.slice('Bearer '.length).trim();
  try {
    const claims = await verifyAccessToken(token);
    req.user = {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      shopId: claims.shopId,
      displayName: null,
    };
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }

  next();
});
