import type { InventoryWithContext } from './inventory.service.js';

export interface InventoryItemDto {
  variantId: string;
  sku: string;
  variantName: string;
  productId: string;
  productTitle: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  version: number;
  updatedAt: string;
}

export function serializeInventoryItem(inventory: InventoryWithContext): InventoryItemDto {
  return {
    variantId: inventory.variantId,
    sku: inventory.variant.sku,
    variantName: inventory.variant.name,
    productId: inventory.variant.product.id,
    productTitle: inventory.variant.product.title,
    quantity: inventory.quantity,
    reserved: inventory.reserved,
    available: inventory.quantity - inventory.reserved,
    lowStockThreshold: inventory.lowStockThreshold,
    isLowStock: inventory.quantity <= inventory.lowStockThreshold,
    version: inventory.version,
    updatedAt: inventory.updatedAt.toISOString(),
  };
}
