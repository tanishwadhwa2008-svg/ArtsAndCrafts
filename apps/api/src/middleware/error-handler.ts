import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import type { ApiFailure } from '@arts/shared';
import {
  AppError,
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from '../lib/errors.js';
import { zodErrorToDetails } from '../lib/zod-error.js';
import { logger } from '../lib/logger.js';
import { isProduction } from '../config/env.js';

/**
 * Maps a known Prisma error to a typed application error so database concerns
 * never leak to the client (OWASP A03/A05).
 */
function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError {
  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[] | undefined)?.join(', ');
      return new ConflictError(
        target ? `A record with this ${target} already exists` : 'Unique constraint violated',
      );
    }
    case 'P2025':
      return new NotFoundError('Requested record was not found');
    case 'P2003':
      return new ConflictError('Related record constraint failed');
    default:
      return new InternalError();
  }
}

/**
 * Central error handler. Normalizes every thrown error into a consistent
 * `ApiFailure` envelope, logs appropriately, and never exposes internal
 * details (stack traces, 5xx messages) to clients in production.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else if (err instanceof ZodError) {
    appError = new ValidationError('Validation failed', zodErrorToDetails(err));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    appError = mapPrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    appError = new ValidationError('Invalid database query');
  } else {
    appError = new InternalError();
  }

  const log = req.log ?? logger;
  if (!appError.isOperational || appError.statusCode >= 500) {
    log.error({ err }, appError.message);
  } else {
    log.warn({ code: appError.code, statusCode: appError.statusCode }, appError.message);
  }

  const exposeMessage = !(appError.statusCode >= 500 && isProduction);

  const body: ApiFailure = {
    ok: false,
    error: {
      code: appError.code,
      message: exposeMessage ? appError.message : 'Internal server error',
      ...(appError.details ? { details: appError.details } : {}),
    },
  };

  res.status(appError.statusCode).json(body);
};
