import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../lib/errors.js';

/**
 * Global baseline rate limiter (OWASP A05 / brute-force mitigation).
 *
 * Applied to every request as a safety net. Tighter, targeted limiters (e.g.
 * on login) are added alongside the relevant routes in later phases. Rejections
 * are funneled through the central error handler for a consistent envelope.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new TooManyRequestsError()),
});
