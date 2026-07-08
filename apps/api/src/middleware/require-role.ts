import type { RequestHandler } from 'express';
import type { Role } from '@arts/shared';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

/**
 * Role-based access control (OWASP A01). Must run after `requireAuth`.
 * Grants access only if the authenticated user's role is in `allowedRoles`.
 */
export function requireRole(...allowedRoles: Role[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}
