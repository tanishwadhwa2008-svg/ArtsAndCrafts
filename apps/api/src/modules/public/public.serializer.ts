import { serializeMoney } from '../../lib/money.js';
import type {
  PublicCollectionCardRow,
  PublicCollectionDetailRow,
  PublicProductCardRow,
  PublicProductDetailRow,
} from './public.service.js';

type WithInventory = { inventory: { quantity: number; reserved: number } | null };

function isInStock(product: WithInventory): boolean {
  return product.inventory != null && product.inventory.quantity - product.inventory.reserved > 0;
}

export interface PublicProductCardDto {
  id: string;
  title: string;
  slug: string;
  price: string;
  currency: string;
  imageUrl: string | null;
  inStock: boolean;
}

export function serializePublicProductCard(product: PublicProductCardRow): PublicProductCardDto {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: serializeMoney(product.basePrice),
    currency: product.currency,
    imageUrl: product.images[0]?.url ?? null,
    inStock: isInStock(product),
  };
}

export interface PublicProductImageDto {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface PublicProductDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: string;
  currency: string;
  inStock: boolean;
  category: { name: string; slug: string } | null;
  images: PublicProductImageDto[];
}

export function serializePublicProductDetail(
  product: PublicProductDetailRow,
): PublicProductDetailDto {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: serializeMoney(product.basePrice),
    currency: product.currency,
    inStock: isInStock(product),
    category: product.category
      ? { name: product.category.name, slug: product.category.slug }
      : null,
    images: product.images.map((img) => ({
      url: img.url,
      altText: img.altText,
      width: img.width,
      height: img.height,
    })),
  };
}

export interface PublicCollectionCardDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  productCount: number;
}

export function serializePublicCollectionCard(
  collection: PublicCollectionCardRow,
): PublicCollectionCardDto {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverUrl: collection.coverUrl ?? collection.products[0]?.product.images[0]?.url ?? null,
    productCount: collection._count.products,
  };
}

export interface PublicCollectionDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  products: PublicProductCardDto[];
}

export function serializePublicCollectionDetail(
  collection: PublicCollectionDetailRow,
): PublicCollectionDetailDto {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverUrl: collection.coverUrl ?? collection.products[0]?.product.images[0]?.url ?? null,
    products: collection.products.map((cp) => serializePublicProductCard(cp.product)),
  };
}

export interface PublicContactDto {
  phone: string | null;
  email: string | null;
  location: string | null;
}

/** Returns an enabled field's trimmed value, or null. Disabled values never leak. */
function enabledContactValue(field: unknown): string | null {
  if (typeof field !== 'object' || field === null) return null;
  const f = field as { enabled?: unknown; value?: unknown };
  if (f.enabled === true && typeof f.value === 'string' && f.value.trim().length > 0) {
    return f.value.trim();
  }
  return null;
}

export function serializePublicContact(contact: unknown): PublicContactDto {
  const c = (contact && typeof contact === 'object' ? contact : {}) as Record<string, unknown>;
  return {
    phone: enabledContactValue(c.phone),
    email: enabledContactValue(c.email),
    location: enabledContactValue(c.location),
  };
}
