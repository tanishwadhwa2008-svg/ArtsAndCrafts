import type { Inventory, ProductImage } from '@prisma/client';
import { serializeMoney } from '../../../lib/money.js';
import type { ProductWithRelations } from './products.service.js';

export interface InventoryDto {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  version: number;
}

export interface ImageDto {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  position: number;
  isPrimary: boolean;
}

export interface ProductDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  basePrice: string;
  currency: string;
  sku: string | null;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  inventory: InventoryDto | null;
  images: ImageDto[];
}

export function serializeInventory(inventory: Inventory): InventoryDto {
  return {
    quantity: inventory.quantity,
    reserved: inventory.reserved,
    available: inventory.quantity - inventory.reserved,
    lowStockThreshold: inventory.lowStockThreshold,
    version: inventory.version,
  };
}

export function serializeImage(image: ProductImage): ImageDto {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
    width: image.width,
    height: image.height,
    position: image.position,
    isPrimary: image.isPrimary,
  };
}

export function serializeProduct(product: ProductWithRelations): ProductDto {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    status: product.status,
    basePrice: serializeMoney(product.basePrice),
    currency: product.currency,
    sku: product.sku,
    categoryId: product.categoryId,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    inventory: product.inventory ? serializeInventory(product.inventory) : null,
    images: product.images.map(serializeImage),
  };
}
