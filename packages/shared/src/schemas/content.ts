import { z } from 'zod';

/**
 * Cross-cutting storefront-content primitives shared by collections, content
 * pages, and maker profiles (E23). Kept separate so each content domain can
 * import the common draft/publish enum without a circular dependency.
 */

/** Draft/publish workflow state for storefront content. */
export const contentStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export type ContentStatus = z.infer<typeof contentStatusSchema>;
