import type { CollectionDetailRow, CollectionListRow } from './collections.service.js';

export interface CollectionListItemDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverStorageKey: string | null;
  status: string;
  position: number;
  productCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionProductDto {
  productId: string;
  position: number;
  title: string;
  slug: string;
  status: string;
  imageUrl: string | null;
}

export interface CollectionDetailDto {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  coverStorageKey: string | null;
  status: string;
  position: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  products: CollectionProductDto[];
}

export function serializeCollectionListItem(collection: CollectionListRow): CollectionListItemDto {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverUrl: collection.coverUrl,
    coverStorageKey: collection.coverStorageKey,
    status: collection.status,
    position: collection.position,
    productCount: collection._count.products,
    publishedAt: collection.publishedAt?.toISOString() ?? null,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
  };
}

export function serializeCollectionDetail(collection: CollectionDetailRow): CollectionDetailDto {
  return {
    id: collection.id,
    title: collection.title,
    slug: collection.slug,
    description: collection.description,
    coverUrl: collection.coverUrl,
    coverStorageKey: collection.coverStorageKey,
    status: collection.status,
    position: collection.position,
    publishedAt: collection.publishedAt?.toISOString() ?? null,
    createdAt: collection.createdAt.toISOString(),
    updatedAt: collection.updatedAt.toISOString(),
    products: collection.products.map((item) => ({
      productId: item.productId,
      position: item.position,
      title: item.product.title,
      slug: item.product.slug,
      status: item.product.status,
      imageUrl: item.product.images[0]?.url ?? null,
    })),
  };
}
