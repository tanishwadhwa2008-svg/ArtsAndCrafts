import { z } from 'zod';
import { slugSchema } from './common.js';
import { contentPageTypeSchema, contentStatusSchema } from './content.js';

/**
 * Content-page + content-block schemas (E23-3). A page (home / story / custom)
 * owns an ordered list of typed blocks; each block's `payload` is validated
 * against a schema specific to its `type` via a discriminated union. Only the
 * five core block types are supported for now; GALLERY and MAKER_SPOTLIGHT are
 * added in later stories.
 */

// --- Pages ---

export const createContentPageSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: slugSchema,
  type: contentPageTypeSchema.default('CUSTOM'),
  status: contentStatusSchema.default('DRAFT'),
  metaTitle: z.string().trim().max(160).optional(),
  metaDescription: z.string().trim().max(320).optional(),
});

export const updateContentPageSchema = createContentPageSchema.partial();

export const contentPageListQuerySchema = z.object({
  type: contentPageTypeSchema.optional(),
  status: contentStatusSchema.optional(),
});

export type CreateContentPageInput = z.infer<typeof createContentPageSchema>;
export type UpdateContentPageInput = z.infer<typeof updateContentPageSchema>;
export type ContentPageListQuery = z.infer<typeof contentPageListQuerySchema>;

// --- Block payloads ---

const ctaSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(300),
});

export const heroBlockSchema = z.object({
  type: z.literal('HERO'),
  payload: z.object({
    eyebrow: z.string().trim().max(80).optional(),
    heading: z.string().trim().min(1).max(160),
    subheading: z.string().trim().max(400).optional(),
    backgroundImageUrl: z.string().url().optional(),
    backgroundImageKey: z.string().trim().max(500).optional(),
    primaryCta: ctaSchema.optional(),
    secondaryCta: ctaSchema.optional(),
  }),
});

export const featuredCollectionsBlockSchema = z.object({
  type: z.literal('FEATURED_COLLECTIONS'),
  payload: z.object({
    heading: z.string().trim().max(160).optional(),
    collectionIds: z.array(z.string().cuid()).max(24),
  }),
});

export const productGridBlockSchema = z.object({
  type: z.literal('PRODUCT_GRID'),
  payload: z.object({
    heading: z.string().trim().max(160).optional(),
    productIds: z.array(z.string().cuid()).max(48),
  }),
});

export const richTextBlockSchema = z.object({
  type: z.literal('RICH_TEXT'),
  payload: z.object({
    heading: z.string().trim().max(160).optional(),
    body: z.string().trim().min(1).max(20_000),
  }),
});

export const bannerBlockSchema = z.object({
  type: z.literal('BANNER'),
  payload: z.object({
    heading: z.string().trim().min(1).max(160),
    text: z.string().trim().max(600).optional(),
    imageUrl: z.string().url().optional(),
    imageKey: z.string().trim().max(500).optional(),
    cta: ctaSchema.optional(),
  }),
});

/**
 * Discriminated union of the supported block inputs. Used for both creating and
 * updating a block; on update the service asserts the type is unchanged.
 */
export const contentBlockInputSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  featuredCollectionsBlockSchema,
  productGridBlockSchema,
  richTextBlockSchema,
  bannerBlockSchema,
]);

export type ContentBlockInput = z.infer<typeof contentBlockInputSchema>;

/** The block types the editor currently supports (subset of the DB enum). */
export const SUPPORTED_BLOCK_TYPES = [
  'HERO',
  'FEATURED_COLLECTIONS',
  'PRODUCT_GRID',
  'RICH_TEXT',
  'BANNER',
] as const;

export const reorderBlocksSchema = z.object({
  blockIds: z.array(z.string().cuid()).max(50),
});

export type ReorderBlocksInput = z.infer<typeof reorderBlocksSchema>;
