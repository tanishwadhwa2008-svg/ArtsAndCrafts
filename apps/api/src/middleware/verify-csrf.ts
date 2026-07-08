import type { RequestHandler } from 'express';
import { ForbiddenError } from '../lib/errors.js';
import { CSRF_COOKIE } from '../lib/cookies.js';
import { safeEqual } from '../lib/refresh-token.js';

/**
 * Double-submit-cookie CSRF protection for cookie-authenticated endpoints
 * (refresh/logout). The client must echo the readable `csrf_token` cookie in
 * an `x-csrf-token` header; the two must match (OWASP A01/CSRF).
 */
export const verifyCsrf: RequestHandler = (req, _res, next) => {
  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.header('x-csrf-token');

  if (!cookieToken || !headerToken || !safeEqual(cookieToken, headerToken)) {
    next(new ForbiddenError('Invalid or missing CSRF token'));
    return;
  }
  next();
};
