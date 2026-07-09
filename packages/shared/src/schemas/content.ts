import { z } from 'zod';

/**
 * Cross-cutting storefront-content primitives shared by collections, content
 * pages, and maker profiles (E23). Kept separate so each content domain can
 * import the common draft/publish enum without a circular dependency.
 */

/** Draft/publish workflow state for storefront content. */
export const contentStatusSchema = z.enum(['DRAFT', 'PUBLISHED']);
export type ContentStatus = z.infer<typeof contentStatusSchema>;

/** Kinds of CMS-managed page. `HOME` is the shop's singleton homepage. */
export const contentPageTypeSchema = z.enum(['HOME', 'STORY', 'ABOUT', 'CUSTOM']);
export type ContentPageType = z.infer<typeof contentPageTypeSchema>;

/** Content-block kinds rendered by the storefront ContentBlockRenderer. */
export const contentBlockTypeSchema = z.enum([
  'HERO',
  'FEATURED_COLLECTIONS',
  'BANNER',
  'RICH_TEXT',
  'GALLERY',
  'MAKER_SPOTLIGHT',
  'PRODUCT_GRID',
]);
export type ContentBlockType = z.infer<typeof contentBlockTypeSchema>;
