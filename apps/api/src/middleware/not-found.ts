import type { RequestHandler } from 'express';
import { NotFoundError } from '../lib/errors.js';

/**
 * Terminal 404 handler for any request that did not match a route. Forwards a
 * `NotFoundError` to the central error handler so the response shape stays
 * consistent with every other error.
 */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};
