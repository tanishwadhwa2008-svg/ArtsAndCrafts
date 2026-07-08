import type { Request } from 'express';
import type { AuthUser } from '../modules/auth/auth.types.js';

/**
 * Request augmentations contributed by the API's own middleware.
 *
 * `validated` holds the output of the Zod validation middleware. Feature
 * routes read strongly-typed data from here rather than trusting raw input
 * (OWASP A03 — validate at the boundary). `user` is set by `requireAuth`.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      validated: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
      user?: AuthUser;
    }
  }
}

export type ValidatedRequest<TBody = unknown, TQuery = unknown, TParams = unknown> = Request & {
  validated: {
    body: TBody;
    query: TQuery;
    params: TParams;
  };
};
