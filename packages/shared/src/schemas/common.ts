import { z } from 'zod';

/**
 * Cross-cutting primitives shared by feature schemas.
 */

/** A small allowlist of supported ISO-4217 currency codes. */
export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'INR',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'CNY',
  'SGD',
  'AED',
  'NZD',
] as const;

export const currencySchema = z.string().trim().toUpperCase().pipe(z.enum(SUPPORTED_CURRENCIES));

/** URL-safe slug: lowercase letters, numbers and single hyphens. */
export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a lowercase, hyphen-separated slug');

/**
 * A monetary amount accepted from clients. Accepts a number or string and
 * validates a non-negative value with at most 2 decimal places. Stored/returned
 * as a string to avoid float precision loss.
 */
export const moneySchema = z.coerce
  .string()
  .regex(/^\d{1,10}(\.\d{1,2})?$/, 'Must be a non-negative amount with up to 2 decimals');

/** Standard pagination query for list endpoints. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Reusable `:id` route-param validator (CUID). */
export const idParamSchema = z.object({
  id: z.string().cuid(),
});
