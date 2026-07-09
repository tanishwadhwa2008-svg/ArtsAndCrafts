import { serializeMoney } from '../../lib/money.js';
import type {
  PublicCollectionCardRow,
  PublicCollectionDetailRow,
  PublicProductCardRow,
  PublicProductDetailRow,
} from './public.service.js';

type VariantWithInventory = { inventory: { quantity: number; reserved: number } | null };

function anyInStock(variants: VariantWithInventory[]): boolean {
  return variants.some(
    (v) => v.inventory != null && v.inventory.quantity - v.inventory.reserved > 0,
  );
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
    inStock: anyInStock(product.variants),
  };
}

export interface PublicProductImageDto {
  url: string;
  altText: string | null;
}

export interface PublicProductVariantDto {
  id: string;
  name: string;
  price: string | null;
  inStock: boolean;
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
  variants: PublicProductVariantDto[];
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
    inStock: anyInStock(product.variants),
    category: product.category
      ? { name: product.category.name, slug: product.category.slug }
      : null,
    images: product.images.map((img) => ({ url: img.url, altText: img.altText })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price != null ? serializeMoney(v.price) : null,
      inStock: v.inventory != null && v.inventory.quantity - v.inventory.reserved > 0,
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
