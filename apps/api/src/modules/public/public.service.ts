import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma.js';
import { NotFoundError } from '../../lib/errors.js';

/**
 * Public storefront read service. UNAUTHENTICATED — only ever exposes ACTIVE
 * products and PUBLISHED collections for the (single) active shop. No mutations.
 *
 * Single-shop for now: the storefront serves one brand, so the shop is resolved
 * as the sole active shop. Multi-tenant hosting would key this on host/slug.
 */

const productCardInclude = {
  images: { orderBy: [{ isPrimary: 'desc' as const }, { position: 'asc' as const }], take: 1 },
  variants: { where: { isActive: true }, include: { inventory: true } },
} satisfies Prisma.ProductInclude;

export type PublicProductCardRow = Prisma.ProductGetPayload<{ include: typeof productCardInclude }>;

const productDetailInclude = {
  images: { orderBy: [{ isPrimary: 'desc' as const }, { position: 'asc' as const }] },
  variants: {
    where: { isActive: true },
    include: { inventory: true },
    orderBy: { createdAt: 'asc' as const },
  },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductInclude;

export type PublicProductDetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

const collectionCardInclude = {
  _count: { select: { products: true } },
  // First active member product's primary image — used as a cover fallback when
  // the collection has no coverUrl of its own.
  products: {
    where: { product: { status: 'ACTIVE' as const, deletedAt: null } },
    orderBy: { position: 'asc' as const },
    take: 1,
    include: {
      product: {
        select: {
          images: {
            orderBy: [{ isPrimary: 'desc' as const }, { position: 'asc' as const }],
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  },
} satisfies Prisma.CollectionInclude;

export type PublicCollectionCardRow = Prisma.CollectionGetPayload<{
  include: typeof collectionCardInclude;
}>;

const collectionDetailInclude = {
  products: {
    where: { product: { status: 'ACTIVE' as const, deletedAt: null } },
    orderBy: { position: 'asc' as const },
    include: { product: { include: productCardInclude } },
  },
} satisfies Prisma.CollectionInclude;

export type PublicCollectionDetailRow = Prisma.CollectionGetPayload<{
  include: typeof collectionDetailInclude;
}>;

/** Resolves the shop the storefront serves (the sole active shop for now). */
export async function resolvePublicShopId(): Promise<string> {
  const shop = await prisma.shop.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  if (!shop) {
    throw new NotFoundError('Storefront is not available');
  }
  return shop.id;
}

export function listPublicProducts(
  shopId: string,
  opts: { search?: string; limit?: number } = {},
): Promise<PublicProductCardRow[]> {
  return prisma.product.findMany({
    where: {
      shopId,
      status: 'ACTIVE',
      deletedAt: null,
      ...(opts.search
        ? { title: { contains: opts.search, mode: 'insensitive' as const } }
        : {}),
    },
    include: productCardInclude,
    orderBy: { createdAt: 'desc' },
    take: opts.limit ?? 24,
  });
}

export async function getPublicProductBySlug(
  shopId: string,
  slug: string,
): Promise<PublicProductDetailRow> {
  const product = await prisma.product.findFirst({
    where: { shopId, slug, status: 'ACTIVE', deletedAt: null },
    include: productDetailInclude,
  });
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export function listPublicCollections(
  shopId: string,
  limit?: number,
): Promise<PublicCollectionCardRow[]> {
  return prisma.collection.findMany({
    where: { shopId, status: 'PUBLISHED', deletedAt: null },
    include: collectionCardInclude,
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    ...(limit ? { take: limit } : {}),
  });
}

export async function getPublicCollectionBySlug(
  shopId: string,
  slug: string,
): Promise<PublicCollectionDetailRow> {
  const collection = await prisma.collection.findFirst({
    where: { shopId, slug, status: 'PUBLISHED', deletedAt: null },
    include: collectionDetailInclude,
  });
  if (!collection) {
    throw new NotFoundError('Collection not found');
  }
  return collection;
}

export async function getPublicHome(shopId: string): Promise<{
  collections: PublicCollectionCardRow[];
  products: PublicProductCardRow[];
}> {
  const [collections, products] = await Promise.all([
    listPublicCollections(shopId, 6),
    listPublicProducts(shopId, { limit: 8 }),
  ]);
  return { collections, products };
}
