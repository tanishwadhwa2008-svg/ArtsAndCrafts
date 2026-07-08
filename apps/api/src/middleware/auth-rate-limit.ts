import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.js';
import { TooManyRequestsError } from '../lib/errors.js';

/**
 * Stricter rate limiter for authentication endpoints (login/register) to blunt
 * brute-force and credential-stuffing attacks (OWASP A07). Disabled under test
 * to keep the suite deterministic.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: () => isTest,
  handler: (_req, _res, next) =>
    next(new TooManyRequestsError('Too many attempts, try again later')),
});
