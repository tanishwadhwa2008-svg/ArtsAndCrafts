import { z } from 'zod';
import { currencySchema, moneySchema, paginationQuerySchema, slugSchema } from './common.js';

/**
 * Catalog schemas: categories, products, variants and product images.
 * Shared between API request validation and (later) web form validation.
 */

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export type ProductStatus = z.infer<typeof productStatusSchema>;

// --- Categories ---

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema,
  description: z.string().trim().max(2000).optional(),
  parentId: z.string().cuid().optional(),
  position: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// --- Products ---

export const createProductSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: slugSchema,
  description: z.string().trim().max(10_000).optional(),
  status: productStatusSchema.default('DRAFT'),
  basePrice: moneySchema,
  currency: currencySchema.default('USD'),
  categoryId: z.string().cuid().optional(),
  metaTitle: z.string().trim().max(160).optional(),
  metaDescription: z.string().trim().max(320).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productListQuerySchema = paginationQuerySchema.extend({
  status: productStatusSchema.optional(),
  categoryId: z.string().cuid().optional(),
  search: z.string().trim().min(1).max(200).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

// --- Variants ---

export const createVariantSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  price: moneySchema.optional(),
  attributes: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const updateVariantSchema = createVariantSchema.partial();

export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

// --- Product images (attach after upload) ---

export const attachImageSchema = z.object({
  storageKey: z.string().trim().min(1).max(500),
  url: z.string().url(),
  altText: z.string().trim().max(300).optional(),
  position: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const updateImageSchema = z.object({
  altText: z.string().trim().max(300).optional(),
  position: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
});

export type AttachImageInput = z.infer<typeof attachImageSchema>;
export type UpdateImageInput = z.infer<typeof updateImageSchema>;
