import { z } from 'zod';
import { paginationQuerySchema } from './common.js';

/**
 * Inventory adjustment schema. A caller may either set an absolute quantity or
 * apply a relative delta (exactly one is required). `expectedVersion` enables
 * optimistic concurrency to prevent lost updates under concurrent edits.
 */
export const adjustInventorySchema = z
  .object({
    setQuantity: z.number().int().min(0).optional(),
    adjustBy: z.number().int().optional(),
    lowStockThreshold: z.number().int().min(0).optional(),
    expectedVersion: z.number().int().min(0).optional(),
  })
  .refine(
    (data) =>
      data.setQuantity !== undefined ||
      data.adjustBy !== undefined ||
      data.lowStockThreshold !== undefined,
    { message: 'Provide setQuantity, adjustBy, or lowStockThreshold' },
  );

export const inventoryListQuerySchema = paginationQuerySchema.extend({
  lowStockOnly: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type AdjustInventoryInput = z.infer<typeof adjustInventorySchema>;
export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;
