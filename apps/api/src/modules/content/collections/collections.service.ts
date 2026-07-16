import { Prisma, type Collection } from '@prisma/client';
import type {
  AiCommitInput,
  CollectionListQuery,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@arts/shared';
import { slugify } from '@arts/shared';
import { prisma } from '../../../db/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../lib/errors.js';

/**
 * Collection service. Every query is scoped to `shopId` and excludes
 * soft-deleted rows so a shop can only see and mutate its own collections
 * (OWASP A01). Publishing stamps `publishedAt` on first publish.
 */

const listInclude = {
  _count: { select: { products: { where: { product: { deletedAt: null } } } } },
} satisfies Prisma.CollectionInclude;

export type CollectionListRow = Prisma.CollectionGetPayload<{ include: typeof listInclude }>;

const detailInclude = {
  products: {
    where: { product: { deletedAt: null } },
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

/**
 * Resolves a slug that is unique within the shop, appending `-2`, `-3`, ... on
 * collision. `seen` guards against duplicates created earlier in the same batch,
 * and `exists` checks the database (inside the surrounding transaction).
 */
async function resolveUniqueSlug(
  base: string,
  seen: Set<string>,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const root = base || 'item';
  let candidate = root;
  let n = 1;
  while (seen.has(candidate) || (await exists(candidate))) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  seen.add(candidate);
  return candidate;
}

/**
 * Persists a reviewed AI bulk-upload draft in a single transaction: creates the
 * collection and one product per image (all DRAFT), attaches each primary image,
 * resolves/creates suggested categories, de-duplicates slugs, and sets ordered
 * membership. All-or-nothing — any failure rolls the whole thing back.
 */
export async function commitAiCollection(
  shopId: string,
  input: AiCommitInput,
): Promise<CollectionDetailRow> {
  return prisma.$transaction(async (tx) => {
    const collectionSlug = await resolveUniqueSlug(
      input.collection.slug,
      new Set<string>(),
      async (slug) =>
        // Match ALL rows (incl. soft-deleted): the @@unique([shopId, slug])
        // constraint spans soft-deleted collections too.
        (await tx.collection.findFirst({
          where: { shopId, slug },
          select: { id: true },
        })) !== null,
    );

    const { status } = input.collection;
    // Publishing the collection also activates its products, so the whole set can
    // go live from a single confirmation; a draft keeps everything as DRAFT.
    const productStatus = status === 'PUBLISHED' ? 'ACTIVE' : 'DRAFT';
    const collection = await tx.collection.create({
      data: {
        shopId,
        title: input.collection.title,
        slug: collectionSlug,
        description: input.collection.description,
        status,
        position: input.collection.position,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    const seenProductSlugs = new Set<string>();
    const categoryCache = new Map<string, string>();
    const orderedProductIds: string[] = [];

    for (const item of input.products) {
      let categoryId: string | null = null;
      if (item.categoryName) {
        const categorySlug = slugify(item.categoryName);
        categoryId = categoryCache.get(categorySlug) ?? null;
        if (!categoryId) {
          // Match ALL rows (the @@unique([shopId, slug]) spans soft-deleted
          // categories); revive a soft-deleted match rather than colliding.
          const existing = await tx.category.findFirst({
            where: { shopId, slug: categorySlug },
            select: { id: true, deletedAt: true },
          });
          if (existing) {
            if (existing.deletedAt) {
              await tx.category.update({ where: { id: existing.id }, data: { deletedAt: null } });
            }
            categoryId = existing.id;
          } else {
            categoryId = (
              await tx.category.create({
                data: { shopId, name: item.categoryName, slug: categorySlug, position: 0 },
              })
            ).id;
          }
          categoryCache.set(categorySlug, categoryId);
        }
      }

      const productSlug = await resolveUniqueSlug(
        item.slug,
        seenProductSlugs,
        async (slug) =>
          // Match ALL rows (incl. soft-deleted): the @@unique([shopId, slug])
          // constraint spans soft-deleted products too.
          (await tx.product.findFirst({
            where: { shopId, slug },
            select: { id: true },
          })) !== null,
      );

      const product = await tx.product.create({
        data: {
          shopId,
          title: item.title,
          slug: productSlug,
          description: item.description,
          status: productStatus,
          basePrice: new Prisma.Decimal(item.basePrice),
          currency: input.currency,
          categoryId,
          metaTitle: item.metaTitle,
          metaDescription: item.metaDescription,
        },
      });

      await tx.productImage.create({
        data: {
          productId: product.id,
          storageKey: item.storageKey,
          url: item.url,
          altText: item.altText,
          position: 0,
          isPrimary: true,
        },
      });

      orderedProductIds.push(product.id);
    }

    await tx.collectionProduct.createMany({
      data: orderedProductIds.map((productId, index) => ({
        collectionId: collection.id,
        productId,
        position: index,
      })),
    });

    return tx.collection.findFirstOrThrow({
      where: { id: collection.id },
      include: detailInclude,
    });
  });
}
