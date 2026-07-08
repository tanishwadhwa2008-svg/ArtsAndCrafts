import type { RequestHandler } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ValidationError } from '../lib/errors.js';
import { zodErrorToDetails } from '../lib/zod-error.js';

export interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates the request against the provided Zod schemas.
 *
 * Parsed (and thus trusted, coerced) values are stored on `req.validated` and
 * mirrored back onto `req.body` for convenience. On failure a `ValidationError`
 * is forwarded to the central error handler with field-level details.
 */
export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req, _res, next) => {
    try {
      const validated: { body?: unknown; query?: unknown; params?: unknown } = {};

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
        req.body = validated.body;
      }
      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }

      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', zodErrorToDetails(error)));
        return;
      }
      next(error);
    }
  };
}
