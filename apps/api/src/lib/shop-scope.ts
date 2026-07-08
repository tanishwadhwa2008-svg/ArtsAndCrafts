import type { Request } from 'express';
import { ForbiddenError } from './errors.js';

/**
 * Resolves the shop (tenant) the authenticated user acts within. Every seller
 * feature is scoped to this id so a user can never read or mutate another
 * shop's data (OWASP A01 — broken access control). Must run after `requireAuth`.
 */
export function requireShopId(req: Request): string {
  const shopId = req.user?.shopId;
  if (!shopId) {
    throw new ForbiddenError('Your account is not associated with a shop');
  }
  return shopId;
}
