import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async route handler so any rejected promise is forwarded to
 * Express's error pipeline instead of crashing the process. Express 4 does not
 * catch async errors automatically, so all async handlers should use this.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
