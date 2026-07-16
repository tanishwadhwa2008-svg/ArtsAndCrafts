import { z } from 'zod';
import { currencySchema, moneySchema, slugSchema } from './common.js';
import { contentStatusSchema } from './content.js';

/**
 * AI-assisted bulk cataloguing schemas.
 *
 * The seller selects one primary image per product (entering a price for each),
 * the images are uploaded via the presigned pipeline, and a vision model drafts
 * a collection (top) plus one product per image (down). The AI never sets price
 * — prices are seller-entered and merged client-side. Everything is reviewed and
 * edited before a separate, transactional commit persists it (Phase 3).
 */

/** A reference to an already-uploaded image (output of the presigned upload). */
export const aiImageRefSchema = z.object({
  storageKey: z.string().trim().min(1).max(500),
  url: z.string().url(),
});
export type AiImageRef = z.infer<typeof aiImageRefSchema>;

/** Request body for `POST /api/v1/ai/collection-draft`. */
export const aiCollectionDraftRequestSchema = z.object({
  // Hard upper bound; the server further enforces the configured AI_MAX_IMAGES.
  images: z.array(aiImageRefSchema).min(1).max(50),
});
export type AiCollectionDraftRequest = z.infer<typeof aiCollectionDraftRequestSchema>;

/**
 * One AI-drafted product, 1:1 with a selected image. Slugs are derived on the
 * server; `categoryName` is a suggestion resolved (or created) at commit time.
 * Note: there is deliberately no price field — price is seller-entered.
 */
export const aiDraftProductSchema = z.object({
  imageIndex: z.number().int().min(0),
  storageKey: z.string(),
  url: z.string().url(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  categoryName: z.string().nullable(),
  altText: z.string(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
});
export type AiDraftProduct = z.infer<typeof aiDraftProductSchema>;

/** AI-drafted collection fields (the "top" of the hierarchy). */
export const aiDraftCollectionSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
});
export type AiDraftCollection = z.infer<typeof aiDraftCollectionSchema>;

/**
 * The draft returned by `POST /api/v1/ai/collection-draft`. The seller reviews
 * and edits this (adding prices) before committing.
 */
export const aiDraftResultSchema = z.object({
  collection: aiDraftCollectionSchema,
  products: z.array(aiDraftProductSchema),
});
export type AiDraftResult = z.infer<typeof aiDraftResultSchema>;

/**
 * One product in a commit payload: the AI draft as reviewed and priced by the
 * seller. `basePrice` is required (seller-entered); `categoryName` is resolved
 * or created at commit; `storageKey`/`url` point at the already-uploaded primary
 * image. There is no status here — everything is committed as DRAFT.
 */
export const aiCommitProductSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: z.string().trim().max(10_000).optional(),
  basePrice: moneySchema,
  categoryName: z.string().trim().min(1).max(120).nullish(),
  altText: z.string().trim().max(300).optional(),
  metaTitle: z.string().trim().max(160).optional(),
  metaDescription: z.string().trim().max(320).optional(),
  storageKey: z.string().trim().min(1).max(500),
  url: z.string().url(),
});
export type AiCommitProduct = z.infer<typeof aiCommitProductSchema>;

/**
 * Request body for `POST /api/v1/collections/ai-commit`: the reviewed collection
 * plus products, persisted transactionally. One batch currency applies to every
 * product. Slugs are de-duplicated and categories resolved/created server-side.
 */
export const aiCommitSchema = z.object({
  collection: z.object({
    title: z.string().trim().min(1).max(160),
    slug: slugSchema,
    description: z.string().trim().max(2000).optional(),
    status: contentStatusSchema.default('DRAFT'),
    position: z.number().int().min(0).default(0),
  }),
  currency: currencySchema.default('USD'),
  products: z.array(aiCommitProductSchema).min(1).max(50),
});
export type AiCommitInput = z.infer<typeof aiCommitSchema>;
