import type { Inventory, ProductImage, ProductVariant } from '@prisma/client';
import { serializeMoney } from '../../../lib/money.js';
import type { ProductWithRelations } from './products.service.js';

export interface InventoryDto {
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  version: number;
}

export interface VariantDto {
  id: string;
  sku: string;
  name: string;
  price: string | null;
  attributes: unknown;
  isActive: boolean;
  inventory: InventoryDto | null;
}

export interface ImageDto {
  id: string;
  url: string;
  altText: string | null;
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
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
  variants: VariantDto[];
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

export function serializeVariant(
  variant: ProductVariant & { inventory?: Inventory | null },
): VariantDto {
  return {
    id: variant.id,
    sku: variant.sku,
    name: variant.name,
    price: variant.price !== null ? serializeMoney(variant.price) : null,
    attributes: variant.attributes,
    isActive: variant.isActive,
    inventory: variant.inventory ? serializeInventory(variant.inventory) : null,
  };
}

export function serializeImage(image: ProductImage): ImageDto {
  return {
    id: image.id,
    url: image.url,
    altText: image.altText,
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
    categoryId: product.categoryId,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    variants: product.variants.map(serializeVariant),
    images: product.images.map(serializeImage),
  };
}
