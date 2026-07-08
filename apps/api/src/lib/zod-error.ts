import type { ZodError } from 'zod';
import type { ErrorDetails } from './errors.js';

/**
 * Converts a ZodError into a flat `{ field: [messages] }` structure suitable
 * for the API error envelope. Shared by the validation middleware and the
 * central error handler so validation output is always shaped consistently.
 */
export function zodErrorToDetails(error: ZodError): ErrorDetails {
  const details: ErrorDetails = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join('.') : '_';
    (details[key] ??= []).push(issue.message);
  }
  return details;
}
