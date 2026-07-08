/**
 * Typed application errors.
 *
 * Throwing one of these anywhere in the request lifecycle lets the central
 * error handler produce a consistent, safe API response with the right HTTP
 * status and a stable machine-readable `code`. `isOperational` distinguishes
 * expected errors (bad input, not found) from unexpected bugs, so we never
 * leak internal details to clients (OWASP A05).
 */
export type ErrorDetails = Record<string, string[]>;

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: ErrorDetails;
  readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      details?: ErrorDetails;
      isOperational?: boolean;
    } = {},
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = options.statusCode ?? 500;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: ErrorDetails) {
    super(message, { statusCode: 400, code: 'BAD_REQUEST', details });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ErrorDetails) {
    super(message, { statusCode: 422, code: 'VALIDATION_ERROR', details });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED' });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, { statusCode: 403, code: 'FORBIDDEN' });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details?: ErrorDetails) {
    super(message, { statusCode: 409, code: 'CONFLICT', details });
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, { statusCode: 429, code: 'TOO_MANY_REQUESTS' });
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, { statusCode: 500, code: 'INTERNAL_ERROR', isOperational: false });
  }
}
