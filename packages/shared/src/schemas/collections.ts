import { z } from 'zod';
import { slugSchema } from './common.js';
import { contentStatusSchema } from './content.js';

/**
 * Collection schemas: curated, shop-scoped sets of products surfaced on the
 * storefront. Shared between API request validation and seller-web forms.
 */

export const createCollectionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional(),
  coverStorageKey: z.string().trim().max(500).optional(),
  coverUrl: z.string().url().optional(),
  status: contentStatusSchema.default('DRAFT'),
  position: z.number().int().min(0).default(0),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const collectionListQuerySchema = z.object({
  status: contentStatusSchema.optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

/**
 * Replace a collection's ordered product membership in one call. Positions are
 * derived from array order, so this covers add, remove, and reorder.
 */
export const setCollectionProductsSchema = z.object({
  productIds: z.array(z.string().cuid()).max(500),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type CollectionListQuery = z.infer<typeof collectionListQuerySchema>;
export type SetCollectionProductsInput = z.infer<typeof setCollectionProductsSchema>;
