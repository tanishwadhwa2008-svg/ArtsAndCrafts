import type { Collection, Prisma } from '@prisma/client';
import type {
  CollectionListQuery,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@arts/shared';
import { prisma } from '../../../db/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../lib/errors.js';

/**
 * Collection service. Every query is scoped to `shopId` and excludes
 * soft-deleted rows so a shop can only see and mutate its own collections
 * (OWASP A01). Publishing stamps `publishedAt` on first publish.
 */

const listInclude = {
  _count: { select: { products: true } },
} satisfies Prisma.CollectionInclude;

export type CollectionListRow = Prisma.CollectionGetPayload<{ include: typeof listInclude }>;

const detailInclude = {
  products: {
    orderBy: { position: 'asc' },
    include: {
      product: {
        include: {
          images: {
            orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
            take: 1,
          },
        },
      },
    },
  },
} satisfies Prisma.CollectionInclude;

export type CollectionDetailRow = Prisma.CollectionGetPayload<{ include: typeof detailInclude }>;

export function listCollections(
  shopId: string,
  query: CollectionListQuery,
): Promise<CollectionListRow[]> {
  return prisma.collection.findMany({
    where: {
      shopId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { title: { contains: query.search, mode: 'insensitive' } } : {}),
    },
    orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
    include: listInclude,
  });
}

export async function getCollection(shopId: string, id: string): Promise<CollectionDetailRow> {
  const collection = await prisma.collection.findFirst({
    where: { id, shopId, deletedAt: null },
    include: detailInclude,
  });
  if (!collection) {
    throw new NotFoundError('Collection not found');
  }
  return collection;
}

async function findCollectionOrThrow(shopId: string, id: string): Promise<Collection> {
  const collection = await prisma.collection.findFirst({
    where: { id, shopId, deletedAt: null },
  });
  if (!collection) {
    throw new NotFoundError('Collection not found');
  }
  return collection;
}

async function assertSlugAvailable(shopId: string, slug: string, excludeId?: string): Promise<void> {
  const existing = await prisma.collection.findFirst({
    where: { shopId, slug, deletedAt: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictError('A collection with this slug already exists');
  }
}

export async function createCollection(
  shopId: string,
  input: CreateCollectionInput,
): Promise<Collection> {
  await assertSlugAvailable(shopId, input.slug);
  return prisma.collection.create({
    data: {
      shopId,
      title: input.title,
      slug: input.slug,
      description: input.description,
      coverStorageKey: input.coverStorageKey,
      coverUrl: input.coverUrl,
      status: input.status,
      position: input.position,
      publishedAt: input.status === 'PUBLISHED' ? new Date() : null,
    },
  });
}

export async function updateCollection(
  shopId: string,
  id: string,
  input: UpdateCollectionInput,
): Promise<Collection> {
  const current = await findCollectionOrThrow(shopId, id);

  if (input.slug && input.slug !== current.slug) {
    await assertSlugAvailable(shopId, input.slug, id);
  }

  // Stamp publishedAt the first time a collection is published; keep it after.
  const publishedAt =
    input.status === 'PUBLISHED' && current.publishedAt === null ? new Date() : undefined;

  return prisma.collection.update({
    where: { id },
    data: {
      title: input.title,
      slug: input.slug,
      description: input.description,
      coverStorageKey: input.coverStorageKey,
      coverUrl: input.coverUrl,
      status: input.status,
      position: input.position,
      ...(publishedAt ? { publishedAt } : {}),
    },
  });
}

export async function deleteCollection(shopId: string, id: string): Promise<void> {
  await findCollectionOrThrow(shopId, id);
  await prisma.collection.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Replace a collection's ordered product membership. Positions follow array
 * order. All product ids must belong to this shop and not be soft-deleted.
 */
export async function setCollectionProducts(
  shopId: string,
  id: string,
  productIds: string[],
): Promise<CollectionDetailRow> {
  await findCollectionOrThrow(shopId, id);

  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length > 0) {
    const count = await prisma.product.count({
      where: { id: { in: uniqueIds }, shopId, deletedAt: null },
    });
    if (count !== uniqueIds.length) {
      throw new BadRequestError('One or more products do not exist in this shop');
    }
  }

  await prisma.$transaction([
    prisma.collectionProduct.deleteMany({ where: { collectionId: id } }),
    prisma.collectionProduct.createMany({
      data: uniqueIds.map((productId, index) => ({ collectionId: id, productId, position: index })),
    }),
  ]);

  return getCollection(shopId, id);
}
