import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env.js';
import { TooManyRequestsError } from '../lib/errors.js';

/**
 * Rate limiter for the (cost-bearing) AI vision endpoints. Vision calls are
 * expensive, so this is stricter than the global limiter. Disabled under test
 * to keep the suite deterministic.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => isTest,
  handler: (_req, _res, next) =>
    next(new TooManyRequestsError('Too many AI requests, please slow down and try again shortly')),
});
