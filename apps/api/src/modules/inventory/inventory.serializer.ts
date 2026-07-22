import type { InventoryWithContext } from './inventory.service.js';

export interface InventoryItemDto {
  productId: string;
  productTitle: string;
  sku: string | null;
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
    productId: inventory.productId,
    productTitle: inventory.product.title,
    sku: inventory.product.sku,
    quantity: inventory.quantity,
    reserved: inventory.reserved,
    available: inventory.quantity - inventory.reserved,
    lowStockThreshold: inventory.lowStockThreshold,
    isLowStock: inventory.quantity <= inventory.lowStockThreshold,
    version: inventory.version,
    updatedAt: inventory.updatedAt.toISOString(),
  };
}
